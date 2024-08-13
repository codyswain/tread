import React from 'react';
import styled from 'styled-components';
import { Button } from '../styles/common/components';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-right: 1px solid ${({ theme }) => theme.border};
  padding: 1rem;
  overflow-y: auto;
`;

const NoteList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const NoteItem = styled.li<{ isSelected: boolean }>`
  cursor: pointer;
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

interface Note {
  id: string;
  title: string;
  content: string;
}

interface SidebarProps {
  notes: Note[];
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ notes, selectedNote, onSelectNote }) => {
  return (
    <SidebarContainer>
      <NoteList>
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            isSelected={selectedNote === note.id}
            onClick={() => onSelectNote(note.id)}
          >
            {note.title}
          </NoteItem>
        ))}
      </NoteList>
    </SidebarContainer>
  );
};

export default Sidebar;