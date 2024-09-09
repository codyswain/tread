import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Note, DirectoryStructure, SimilarNote } from "@/shared/types";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const [directoryStructures, setDirectoryStructures] = useState<
    { [key: string]: DirectoryStructure } | undefined
  >({
    undefined: { name: "", type: "directory", children: [], fullPath: "" },
  });

  const [activeNotePath, setActiveNotePath] = useState<string | null>(null);

  const [activeFileNode, setActiveFileNode] = useState<DirectoryStructure | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // const [activeNote, setActiveNote] = useState<string | null>(null);
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const allDirStructures: { [key: string]: DirectoryStructure } = {};
      for (const dirPath of topLevelDirPath) {
        const dirStructure = await window.electron.getDirectoryStructure(
          dirPath
        );
        allDirStructures[dirPath] = dirStructure;
      }
      // store the entire set of file nodes
      setDirectoryStructures(allDirStructures);
      // const printAllDirStructures = (allDirStructures: {
      //   [key: string]: DirectoryStructure;
      // }): void => {
      //   console.log("All Directory Structures:");
      //   console.log("========================");
      //   for (const [path, structure] of Object.entries(allDirStructures)) {
      //     console.log(`\nRoot: ${path}`);
      //     printDirectoryStructure(structure);
      //   }
      // };

      // const printDirectoryStructure = (
      //   structure: DirectoryStructure,
      //   indent = ""
      // ): void => {
      //   console.log(`${indent}${structure.name} (${structure.type})`);

      //   if (structure.type === "directory" && structure.children) {
      //     structure.children.forEach((child) => {
      //       if (child.type === "directory") {
      //         printDirectoryStructure(child, indent + "  ");
      //       } else {
      //         console.log(`${indent}  ${child.name} (${child.type})`);
      //       }
      //     });
      //   }
      // };

      // printAllDirStructures(allDirStructures);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // const loadNotes = useCallback(async () => {
  //   setIsLoading(true);
  //   try {
  //     const structure = await window.electron.loadNotes();
  //     setDirectoryStructure(structure);
  //     const allNotes = extractNotesFromStructure(structure);

  //     setNotes(allNotes);
  //     if (allNotes.length > 0 && !activeNote) {
  //       setActiveNote(allNotes[0].id);
  //     }
  //   } catch (error) {
  //     console.error('Error loading notes:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [activeNote]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // const extractNotesFromStructure = (structure: DirectoryStructure): Note[] => {
  //   const extractedNotes: Note[] = [];
  //   const traverse = (node: DirectoryStructure) => {
  //     if (node.type === "note" && node.note) {
  //       extractedNotes.push(node.note);
  //     }
  //     if (node.children) {
  //       node.children.forEach(traverse);
  //     }
  //   };
  //   traverse(structure);
  //   return extractedNotes;
  // };

  const createNote = useCallback(
    async (dirPath: string) => {
      const timestamp = new Date().toISOString();
      const newNote: Note = {
        id: uuidv4(),
        title: `Untitled Note ${timestamp.slice(0, 19).replace("T", " ")}`,
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
      await window.electron.updateNote(updatedNote, activeFileNode.fullPath);
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

  // const selectNote = useCallback((noteId: string) => {
  //   setActiveNote(noteId);
  // }, []);

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

  return {
    notes,
    directoryStructures,
    similarNotes,
    isLoading,
    createNote,
    saveNote,
    // deleteNote,
    // selectNote,
    findSimilarNotes,
    loadNotes,

    // new
    activeNotePath,
    setActiveNotePath,
    activeNote,
    activeFileNode, 
    setActiveFileNode,
    deleteFileNode
  };
};
