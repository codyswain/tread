import React from 'react';
import styled from 'styled-components';

const RelatedNotesContainer = styled.div`
  width: 200px;
  background-color: ${({ theme }) => theme.background};
  border-left: 1px solid ${({ theme }) => theme.text};
  padding: 1rem;
`;

const RelatedNotesList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const RelatedNoteItem = styled.li`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.text};
`;

const RelatedNotes: React.FC = () => {
  // This is just a placeholder. In the future, you'll implement logic to show actually related notes.
  const placeholderNotes = ['Related Note 1', 'Related Note 2', 'Related Note 3'];

  return (
    <RelatedNotesContainer>
      <h3>Related Notes</h3>
      <RelatedNotesList>
        {placeholderNotes.map((note, index) => (
          <RelatedNoteItem key={index}>{note}</RelatedNoteItem>
        ))}
      </RelatedNotesList>
    </RelatedNotesContainer>
  );
};

export default RelatedNotes;