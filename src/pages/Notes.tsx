import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import NoteEditor from '../components/NoteEditor';
import Sidebar from '../components/Sidebar';
import RelatedNotes from '../components/RelatedNotes';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const ActionButton = styled(Button)`
  background-color: #007aff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }

  svg {
    margin-right: 5px;
  }
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
      console.error('Error loading notes:', error);
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
              <FaTrash /> Delete
            </ActionButton>
          )}
        </ButtonContainer>
        <EditorContainer>
          {selectedNote ? (
            <NoteEditor
              note={notes.find(note => note.id === selectedNote) || { id: '', title: '', content: '' }}
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