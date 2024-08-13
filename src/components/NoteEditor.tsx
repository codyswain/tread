import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { FaSave } from 'react-icons/fa';
import { Button, Input } from '../styles/common/components';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  padding: 1rem;
  font-size: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  resize: none;
  margin-bottom: 1rem;
`;

const PreviewContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const SaveButton = styled(Button)`
  align-self: flex-end;
`;

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = useCallback(() => {
    onSave({ ...note, title, content });
  }, [note, title, content, onSave]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [title, content, handleSave]);

  return (
    <EditorContainer>
      <Input 
        type="text" 
        value={title} 
        onChange={handleTitleChange} 
        placeholder="Note Title"
      />
      <StyledTextarea value={content} onChange={handleContentChange} />
      <PreviewContainer>
        <ReactMarkdown>{content}</ReactMarkdown>
      </PreviewContainer>
      <SaveButton onClick={handleSave}>
        <FaSave /> Save
      </SaveButton>
    </EditorContainer>
  );
};

export default NoteEditor;