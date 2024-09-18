// src/features/notes/components/Toolbar.tsx

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Code2,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/components/Button';

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) =>
    cn(
      'p-2 rounded-md',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'hover:bg-accent hover:text-accent-foreground'
    );

  return (
    <div className="flex items-center space-x-1 mb-4 bg-muted/50 p-2 rounded-md">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        variant="ghost"
        size="icon"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        variant="ghost"
        size="icon"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
        variant="ghost"
        size="icon"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={buttonClass(editor.isActive('code'))}
        variant="ghost"
        size="icon"
      >
        <Code className="h-4 w-4" />
      </Button>
      <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2" />
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        variant="ghost"
        size="icon"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        variant="ghost"
        size="icon"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2" />
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        variant="ghost"
        size="icon"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editor.isActive('codeBlock'))}
        variant="ghost"
        size="icon"
      >
        <Code2 className="h-4 w-4" />
      </Button>
      <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2" />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        variant="ghost"
        size="icon"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        variant="ghost"
        size="icon"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 3 }))}
        variant="ghost"
        size="icon"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Toolbar;
