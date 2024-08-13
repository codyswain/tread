import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import NoteEditor from '../components/NoteEditor';
import Sidebar from '../components/Sidebar';
import RelatedNotes from '../components/RelatedNotes';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Card } from '../styles/common/components';

const NotesContainer = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const MainContent = styled(Card)`
  flex: 1;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const ActionButton = styled(Button)`
  margin-left: 0.5rem;
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
      console.error('Error loading notes:', error);
      // Implement user-facing error message here
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    const newNote = { id: Date.now().toString(), title: 'New Note', content: '' };
    try {
      await window.electron.saveNote(newNote);
      setNotes(prevNotes => [...prevNotes, newNote]);
      setSelectedNote(newNote.id);
    } catch (error) {
      console.error('Error creating note:', error);
      // Implement user-facing error message here
    }
  };

  const handleSaveNote = async (updatedNote: Note) => {
    try {
      await window.electron.saveNote(updatedNote);
      setNotes(prevNotes => prevNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
    } catch (error) {
      console.error('Error saving note:', error);
      // Implement user-facing error message here
    }
  };

  const handleDeleteNote = async () => {
    if (selectedNote) {
      try {
        await window.electron.deleteNote(selectedNote);
        setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNote));
        setSelectedNote(notes.length > 1 ? notes[0].id : null);
      } catch (error) {
        console.error('Error deleting note:', error);
        // Implement user-facing error message here
      }
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
      />
      <MainContent>
        <ButtonContainer>
          <ActionButton onClick={handleCreateNote}>
            <FaPlus /> New Note
          </ActionButton>
          {selectedNote && (
            <ActionButton onClick={handleDeleteNote}>
              <FaTrash /> Delete Note
            </ActionButton>
          )}
        </ButtonContainer>
        {selectedNote ? (
          <NoteEditor
            note={notes.find(note => note.id === selectedNote) || { id: '', title: '', content: '' }}
            onSave={handleSaveNote}
          />
        ) : (
          <p>Select a note or create a new one</p>
        )}
      </MainContent>
      <RelatedNotes />
    </NotesContainer>
  );
};

export default Notes;