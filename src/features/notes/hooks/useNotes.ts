import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useCallback } from "react";
import {
  Note,
  DirectoryStructure,
  SimilarNote,
  DirectoryStructures,
} from "@/shared/types";


export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [directoryStructures, setDirectoryStructures] = useState<DirectoryStructures>({});
  const [activeNotePath, setActiveNotePath] = useState<string | null>(null);
  const [activeFileNode, setActiveFileNode] = useState<DirectoryStructure | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [similarNotesIsLoading, setSimilarNotesIsLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // File System Explorer State
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Mounted Folder States
  const [mountedDirPaths, setMountedDirPaths] = useState<string[]>([]);
  const [isLoadingMountedDirPaths, setIsLoadingMountedDirPaths] = useState(false);
  const [mountedDirPathsLoadError, setMountedDirPathsLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (activeNotePath) {
      const fileNode = getFileNodeFromPath(activeNotePath);
      if (fileNode) {
        setActiveFileNode(fileNode);
      } else {
        console.error("Could not find file node for path", activeNotePath);
      }
    }
  }, [activeNotePath, directoryStructures]);

    
  // Load the active note based on the active file node
  useEffect(() => {
    let isCurrent = true;
  
    const loadActiveNote = async () => {
      if (activeFileNode?.type === "note") {
        try {
          const loadedNote = await window.electron.loadNote(activeFileNode.fullPath);
          if (isCurrent) {
            setActiveNote(loadedNote);
          }
        } catch (err) {
          console.error("Failed to load note:", err);
          if (isCurrent) {
            setActiveNote(null);
          }
        }
      } else {
        if (isCurrent) {
          setActiveNote(null);
        }
      }
    };
    loadActiveNote();
  
    return () => {
      isCurrent = false;
    };
  }, [activeFileNode]);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const topLevelDirPaths = await window.electron.getTopLevelFolders();
      const dirStructurePromises = topLevelDirPaths.map(async (dirPath) => {
        try {
          const dirStructure = await window.electron.getDirectoryStructure(dirPath);
          return { [dirPath]: dirStructure };
        } catch (err) {
          console.error(`Failed to load directory structure for ${dirPath}:`, err);
          return {};
        }
      });
      const dirStructuresArray = await Promise.all(dirStructurePromises);
      const allDirStructures = Object.assign({}, ...dirStructuresArray);
      setDirectoryStructures(allDirStructures);
    } catch (err) {
      console.error("Failed to load top-level directories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(
    async (dirPath: string) => {
      const timestamp = new Date().toISOString();
      const newNote: Note = {
        id: uuidv4(),
        title: "Untitled Note",
        content: "",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      try {
        const savedNotePath = await window.electron.saveNote(newNote, dirPath);
        await loadNotes();
        setActiveNotePath(savedNotePath);
      } catch (error) {
        console.error("Error creating note:", error);
      }
    },
    [loadNotes]
  );

  const saveNote = useCallback(
    async (updatedNote: Note) => {
      if (!activeFileNode || activeFileNode.type !== "note") {
        console.error("No active note file node");
        return;
      }
      try {
        const dirPath = activeFileNode.fullPath.substring(
          0,
          activeFileNode.fullPath.lastIndexOf("/")
        );
        await window.electron.saveNote(updatedNote, dirPath);
      } catch (error) {
        console.error("Error saving note:", error);
      }
    },
    [activeFileNode]
  );

  const deleteFileNode = useCallback(
    async (fileNode: DirectoryStructure) => {
      try {
        await window.electron.deleteFileNode(fileNode.type, fileNode.fullPath);
        const topLevelFolderPaths = await window.electron.getTopLevelFolders();
        if (topLevelFolderPaths.includes(fileNode.fullPath)) {
          await window.electron.removeTopLevelFolder(fileNode.fullPath);
        }
        await loadNotes();
      } catch (error) {
        console.error("Error deleting file node:", error);
      }
    },
    [loadNotes]
  );

  const findSimilarNotes = useCallback(async () => {
    if (!activeNote) {
      setSimilarNotes([]);
      setSimilarNotesIsLoading(false);
      return;
    }
    setSimilarNotesIsLoading(true);
    try {
      const similarNotes = await window.electron.findSimilarNotes(
        activeNote.content,
        directoryStructures
      );
      setSimilarNotes(
        similarNotes.filter(
          (note: SimilarNote) => note.id !== activeNote.id && note.score >= 0.6
        )
      );
    } catch (error) {
      console.error("Error finding similar notes:", error);
      setSimilarNotes([]);
    } finally {
      setSimilarNotesIsLoading(false);
    }
  }, [activeNote?.content, activeNote?.id, directoryStructures]);  

  const toggleDirectory = useCallback((fileNode: DirectoryStructure) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileNode.fullPath)) {
        newSet.delete(fileNode.fullPath);
      } else {
        newSet.add(fileNode.fullPath);
      }
      return newSet;
    });
  }, []);

  const handleCreateFolder = useCallback((fileNode: DirectoryStructure) => {
    setActiveFileNode(fileNode);
    setIsCreatingFolder(true);
    setNewFolderName("");
    setError(null);
  }, []);

  const confirmCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    const invalidChars = /[<>:"/\\|?*\p{C}]/u;
    if (invalidChars.test(newFolderName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    if (!activeFileNode) {
      setError("No active directory selected");
      return;
    }

    try {
      await window.electron.createDirectory(
        `${activeFileNode.fullPath}/${newFolderName.trim()}`
      );
      setIsCreatingFolder(false);
      setNewFolderName("");
      setError(null);
      await loadNotes();
    } catch (err) {
      setError(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [activeFileNode, newFolderName, loadNotes]);

  const cancelCreateFolder = useCallback(() => {
    setIsCreatingFolder(false);
    setNewFolderName("");
    setError(null);
  }, []);

  const loadMountedDirPaths = useCallback(async () => {
    setIsLoadingMountedDirPaths(true);
    setMountedDirPathsLoadError(null);
    try {
      const dirPaths = await window.electron.getTopLevelFolders();
      setMountedDirPaths(dirPaths);
    } catch (error) {
      setMountedDirPathsLoadError("Failed to load top-level folders");
      console.error(error);
    } finally {
      setIsLoadingMountedDirPaths(false);
    }
  }, []);

  useEffect(() => {
    loadMountedDirPaths();
  }, [loadMountedDirPaths]);

  const openDialogToMountDirpath = useCallback(async () => {
    const result = await window.electron.openFolderDialog();
    if (result) {
      await window.electron.addTopLevelFolder(result);
      await loadMountedDirPaths();
      await loadNotes();
    }
  }, [loadMountedDirPaths, loadNotes]);

  const createEmbedding = useCallback(async (): Promise<boolean> => {
    if (activeFileNode?.type === "note" && activeNote) {
      try {
        await window.electron.generateNoteEmbeddings(activeNote, activeFileNode);
        return true;
      } catch (error) {
        console.error(`Failed generating note embedding:`, error);
        return false;
      }
    } else {
      console.error(`Embedding creation triggered for invalid file node type`);
      return false;
    }
  }, [activeFileNode, activeNote]);

  const getFileNodeFromNote = useCallback(
    (note: Note): DirectoryStructure | null => {
      const findFileNode = (node: DirectoryStructure): DirectoryStructure | null => {
        if (node.type === "note" && node.noteMetadata?.id === note.id) {
          return node;
        }
        if (node.type === "directory" && node.children) {
          for (const child of node.children) {
            const result = findFileNode(child);
            if (result) return result;
          }
        }
        return null;
      };
  
      for (const dirStructure of Object.values(directoryStructures)) {
        const fileNode = findFileNode(dirStructure);
        if (fileNode) return fileNode;
      }
      return null;
    },
    [directoryStructures]
  );

  const getFileNodeFromPath = useCallback(
    (fullPath: string): DirectoryStructure | null => {
      const findFileNode = (node: DirectoryStructure): DirectoryStructure | null => {
        if (node.fullPath === fullPath) {
          return node;
        }
        if (node.type === "directory" && node.children) {
          for (const child of node.children) {
            const result = findFileNode(child);
            if (result) return result;
          }
        }
        return null;
      };
  
      for (const dirStructure of Object.values(directoryStructures)) {
        const fileNode = findFileNode(dirStructure);
        if (fileNode) return fileNode;
      }
      return null;
    },
    [directoryStructures]
  );

  const openNote = useCallback(
    (note: Note) => {
      const fileNode = getFileNodeFromNote(note);
      if (fileNode) {
        setActiveFileNode(fileNode);
        setActiveNotePath(fileNode.fullPath);
      } else {
        console.error("Could not find file node for note", note);
      }
    },
    [getFileNodeFromNote]
  );

  return {
    notes,
    directoryStructures,
    similarNotes,
    isLoading,
    createNote,
    saveNote,
    findSimilarNotes,
    loadNotes,
    activeNotePath,
    setActiveNotePath,
    activeNote,
    activeFileNode,
    setActiveFileNode,
    deleteFileNode,
    expandedDirs,
    toggleDirectory,
    currentPath,
    setCurrentPath,
    handleCreateFolder,
    newFolderState: {
      isCreatingFolder,
      newFolderName,
      setNewFolderName,
      confirmCreateFolder,
      cancelCreateFolder,
      error,
    },
    openDialogToMountDirpath,
    createEmbedding,
    getFileNodeFromNote,
    similarNotesIsLoading,
    getFileNodeFromPath,
    openNote
  };
};
