import React, { useState, useEffect } from "react";
import NoteEditor from "../components/NoteEditor";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Navbar from "../components/Navbar";

interface Note {
  id: string;
  title: string;
  content: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);


  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const loadedNotes = await window.electron.loadNotes();
      setNotes(loadedNotes);
      if (loadedNotes.length > 0 && !selectedNote) {
        setSelectedNote(loadedNotes[0].id);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
    };
    try {
      await window.electron.saveNote(newNote);
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setSelectedNote(newNote.id);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleSaveNote = async (updatedNote: Note) => {
    try {
      await window.electron.saveNote(updatedNote);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        )
      );
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await window.electron.deleteNote(noteId);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      if (selectedNote === noteId) {
        setSelectedNote(notes.length > 1 ? notes[0].id : null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarOpen(!isLeftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading notes...</div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Navbar
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
      />
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={setSelectedNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
      <main className={`flex-grow transition-all duration-300 p-4 pt-12 ${isLeftSidebarOpen ? 'ml-64' : 'ml-10'} ${isRightSidebarOpen ? 'mr-64' : 'mr-10'}`}>
        {selectedNote ? (
          <NoteEditor
            note={
              notes.find((note) => note.id === selectedNote) || {
                id: "",
                title: "",
                content: "",
              }
            }
            onSave={handleSaveNote}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">Select a note or create a new one</p>
          </div>
        )}
      </main>
      <RightSidebar isOpen={isRightSidebarOpen} />
    </div>
  );
};

export default Notes;