import React, { useState, useEffect } from "react";
import styled from "styled-components";
import NoteEditor from "../components/NoteEditor";
import Sidebar from "../components/Sidebar";
import RelatedNotes from "../components/RelatedNotes";

const NotesContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f7;
  color: #1d1d1f;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 20px;
`;

const EditorContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

interface Note {
  id: string;
  title: string;
  content: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  return (
    <NotesContainer>
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={setSelectedNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
      <MainContent>
        <EditorContainer>
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
            <p>Select a note or create a new one</p>
          )}
        </EditorContainer>
      </MainContent>
      <RelatedNotes />
    </NotesContainer>
  );
};

export default Notes;