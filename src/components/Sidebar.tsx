import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash } from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-right: 1px solid ${({ theme }) => theme.border};
  padding: 1rem;
  overflow-y: auto;
`;

const NewNoteButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const NoteList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const NoteItem = styled.li<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: ${({ isSelected, theme }) => isSelected ? theme.primary : theme.cardBackground};
  color: ${({ isSelected, theme }) => isSelected ? theme.buttonText : theme.text};
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ isSelected, theme }) => isSelected ? theme.primaryHover : theme.border};
  }
`;

const NoteTitle = styled.span`
  cursor: pointer;
  flex-grow: 1;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

interface Note {
  id: string;
  title: string;
  content: string;
}

interface SidebarProps {
  notes: Note[];
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ notes, selectedNote, onSelectNote, onCreateNote, onDeleteNote }) => {
  return (
    <SidebarContainer>
      <NewNoteButton onClick={onCreateNote}>
        <FaPlus /> New Note
      </NewNoteButton>
      <NoteList>
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            isSelected={selectedNote === note.id}
          >
            <NoteTitle onClick={() => onSelectNote(note.id)}>
              {note.title}
            </NoteTitle>
            <DeleteButton onClick={() => onDeleteNote(note.id)}>
              <FaTrash />
            </DeleteButton>
          </NoteItem>
        ))}
      </NoteList>
    </SidebarContainer>
  );
};

export default Sidebar;