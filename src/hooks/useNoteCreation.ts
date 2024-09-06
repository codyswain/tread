import { useState } from "react";
import { v4 as uuidv4 } from 'uuid'; // Add this import
import { Note } from "@/types";

export const useNoteCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createNote = async (dirPath = "") => {
    setIsCreating(true);
    try {
      const newNote: Note = {
        id: uuidv4(),
        title: "Untitled",
        content: "",
      };
      await window.electron.saveNote(newNote, dirPath);
      setIsCreating(false);
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      setIsCreating(false);
      return null;
    }
  };

  return { isCreating, createNote };
};