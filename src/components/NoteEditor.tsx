import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaCode, FaQuoteRight, FaHighlighter } from 'react-icons/fa';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f7;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const EditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
`;

const ToolbarButton = styled.button<{ active?: boolean }>`
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 8px;
  font-size: 14px;
  background-color: ${({ active }) => active ? '#007aff' : '#f0f0f0'};
  color: ${({ active }) => active ? '#ffffff' : '#333333'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ active }) => active ? '#0056b3' : '#e0e0e0'};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.5);
  }
`;

const StyledEditorContent = styled(EditorContent)`
  .ProseMirror {
    flex: 1;
    padding: 16px;
    font-size: 16px;
    line-height: 1.5;
    color: #333333;
    background-color: #ffffff;
    border: none;
    border-radius: 0 0 10px 10px;
    outline: none;

    &:focus {
      outline: none;
    }

    p {
      margin-bottom: 1em;
    }

    ul, ol {
      padding-left: 1.5em;
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.2;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    code {
      background-color: #f0f0f0;
      color: #333333;
      padding: 2px 4px;
      border-radius: 4px;
    }

    pre {
      background: #f5f5f7;
      color: #333333;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      padding: 12px 16px;
      border-radius: 6px;
      overflow-x: auto;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 14px;
      }
    }

    blockquote {
      border-left: 4px solid #007aff;
      margin-left: 0;
      padding-left: 16px;
      color: #666666;
    }
  }
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  background-color: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: #999999;
  }
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      onSave({ ...note, title, content: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onSave({ ...note, title: newTitle, content: editor?.getHTML() || note.content });
  };

  const applyFormat = useCallback((format: string) => {
    if (editor) {
      switch (format) {
        case 'bold':
          editor.chain().focus().toggleBold().run();
          break;
        case 'italic':
          editor.chain().focus().toggleItalic().run();
          break;
        case 'underline':
          editor.chain().focus().toggleUnderline().run();
          break;
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'alignLeft':
          editor.chain().focus().setTextAlign('left').run();
          break;
        case 'alignCenter':
          editor.chain().focus().setTextAlign('center').run();
          break;
        case 'alignRight':
          editor.chain().focus().setTextAlign('right').run();
          break;
        case 'codeBlock':
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case 'blockquote':
          editor.chain().focus().toggleBlockquote().run();
          break;
        case 'highlight':
          editor.chain().focus().toggleHighlight().run();
          break;
        default:
          break;
      }
    }
  }, [editor]);

  return (
    <EditorContainer>
      <ContentContainer>
        <TitleInput 
          type="text" 
          value={title} 
          onChange={handleTitleChange} 
          placeholder="Note Title"
        />
        <EditorToolbar>
          <ToolbarButton onClick={() => applyFormat('bold')} active={editor?.isActive('bold')}>
            <FaBold />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('italic')} active={editor?.isActive('italic')}>
            <FaItalic />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('underline')} active={editor?.isActive('underline')}>
            <FaUnderline />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('bulletList')} active={editor?.isActive('bulletList')}>
            <FaListUl />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('orderedList')} active={editor?.isActive('orderedList')}>
            <FaListOl />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('alignLeft')} active={editor?.isActive({ textAlign: 'left' })}>
            <FaAlignLeft />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('alignCenter')} active={editor?.isActive({ textAlign: 'center' })}>
            <FaAlignCenter />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('alignRight')} active={editor?.isActive({ textAlign: 'right' })}>
            <FaAlignRight />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('codeBlock')} active={editor?.isActive('codeBlock')}>
            <FaCode />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('blockquote')} active={editor?.isActive('blockquote')}>
            <FaQuoteRight />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat('highlight')} active={editor?.isActive('highlight')}>
            <FaHighlighter />
          </ToolbarButton>
        </EditorToolbar>
        <StyledEditorContent editor={editor} />
      </ContentContainer>
    </EditorContainer>
  );
};

export default NoteEditor;