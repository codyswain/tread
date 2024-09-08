import { useState, useEffect, useCallback } from 'react';
import { Note, DirectoryStructure, SimilarNote } from '@/shared/types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure>({ name: '', type: 'directory', children: [] });
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const structure = await window.electron.loadNotes();
      setDirectoryStructure(structure);
      const allNotes = extractNotesFromStructure(structure);
      setNotes(allNotes);
      if (allNotes.length > 0 && !activeNote) {
        setActiveNote(allNotes[0].id);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeNote]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const extractNotesFromStructure = (structure: DirectoryStructure): Note[] => {
    const extractedNotes: Note[] = [];
    const traverse = (node: DirectoryStructure) => {
      if (node.type === 'note' && node.note) {
        extractedNotes.push(node.note);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(structure);
    return extractedNotes;
  };

  const createNote = useCallback(async (dirPath: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
    };
    try {
      await window.electron.saveNote(newNote, dirPath);
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setActiveNote(newNote.id);
      await loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }, [loadNotes]);

  const saveNote = useCallback(async (updatedNote: Note) => {
    try {
      await window.electron.saveNote(updatedNote, '');
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      await window.electron.saveEmbedding(updatedNote.id, updatedNote.content);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string, dirPath: string) => {
    try {
      await window.electron.deleteNote(noteId, dirPath);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      if (activeNote === noteId) {
        setActiveNote(notes[0]?.id || null);
      }
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [activeNote, loadNotes, notes]);

  const selectNote = useCallback((noteId: string) => {
    setActiveNote(noteId);
  }, []);

  const findSimilarNotes = useCallback(async (query: string) => {
    try {
      const similarNoteIds = await window.electron.findSimilarNotes(query);
      const similar = notes.filter((note) => similarNoteIds.includes(note.id));
      setSimilarNotes(similar);
    } catch (error) {
      console.error('Error finding similar notes:', error);
    }
  }, [notes]);

  return {
    notes,
    directoryStructure,
    activeNote,
    similarNotes,
    isLoading,
    createNote,
    saveNote,
    deleteNote,
    selectNote,
    findSimilarNotes,
    loadNotes,
  };
};