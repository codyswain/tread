import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Note, DirectoryStructure, SimilarNote, DirectoryStructures } from "@/shared/types";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [directoryStructures, setDirectoryStructures] = useState<DirectoryStructures | undefined>({
    'undefined': {
      name: 'undefined',
      type: 'directory',
      fullPath: 'undefined'
    }
  });
  const [activeNotePath, setActiveNotePath] = useState<string | null>(null);
  const [activeFileNode, setActiveFileNode] = useState<DirectoryStructure | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // File System Explorer State
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);


  // Load the active note based on setting the active note path
  useEffect(() => {
    const loadActiveNote = async () => {
      if (activeFileNode && activeFileNode.type === 'note') {
        try {
          const loadedNote = await window.electron.loadNote(activeFileNode.fullPath);
          setActiveNote(loadedNote);
        } catch (err) {
          console.error('Failed to load note file node with error: ', err);
          setActiveNote(null);
        }
      } else {
        setActiveNote(null);
      }
    };

    loadActiveNote();
  }, [activeFileNode]);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const topLevelDirPath = await window.electron.getTopLevelFolders();
      console.log(`Top level directories: ${topLevelDirPath}`);

      // for each top level folder path, fetch the directory structure.
      // this is done in the app side code so that we can later add dynamic loading
      const allDirStructures: DirectoryStructures = {};
      for (const dirPath of topLevelDirPath) {
        const dirStructure = await window.electron.getDirectoryStructure(
          dirPath
        );
        allDirStructures[dirPath] = dirStructure;
      }
      setDirectoryStructures(allDirStructures);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(
    async (dirPath: string) => {
      console.log(`Attempting to create note with dirPath=${dirPath}`)
      const timestamp = new Date().toISOString();
      const newNote: Note = {
        id: uuidv4(),
        title: `Untitled Note`,
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

  const saveNote = useCallback(async (updatedNote: Note) => {
    try {
      if (!activeFileNode || activeFileNode.type !== 'note') {
        throw new Error('No active note file node');
      }
      const dirPath = activeFileNode.fullPath.substring(0, activeFileNode.fullPath.lastIndexOf('/'));
      await window.electron.saveNote(updatedNote, dirPath);
      // await window.electron.saveEmbedding(updatedNote.id, updatedNote.content);
      // Reload notes to reflect any changes in the file system
      await loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  }, [activeFileNode, loadNotes]);

  const deleteFileNode = useCallback(
    async (fileNode: DirectoryStructure) => {
      try {
        await window.electron.deleteFileNode(fileNode.type, fileNode.fullPath);
        // TODO: set active note after deletion
        await loadNotes();
      } catch (error) {
        console.error("Error deleting file node:", error);
      }
    },
    [loadNotes]
  );

  const findSimilarNotes = useCallback(
    async (query: string) => {
      try {
        const similarNoteIds = await window.electron.findSimilarNotes(query);
        const similar = notes.filter((note) =>
          similarNoteIds.includes(note.id)
        );
        setSimilarNotes(similar);
      } catch (error) {
        console.error("Error finding similar notes:", error);
      }
    },
    [notes]
  );

  const toggleDirectory = useCallback((dirPath: string) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dirPath)) {
        newSet.delete(dirPath);
      } else {
        newSet.add(dirPath);
      }
      return newSet;
    });
  }, []);

  const handleCreateFolder = useCallback(() => {
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

    try {
      await window.electron.createDirectory(`${currentPath}/${newFolderName.trim()}`);
      setIsCreatingFolder(false);
      setNewFolderName("");
      setError(null);
      await loadNotes(); // Reload notes to reflect the new folder
    } catch (err) {
      setError(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [currentPath, newFolderName, loadNotes]);

  const cancelCreateFolder = useCallback(() => {
    setIsCreatingFolder(false);
    setNewFolderName("");
    setError(null);
  }, []);

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
  };
};
