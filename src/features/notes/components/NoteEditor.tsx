// src/features/notes/components/NoteEditor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@/shared/components/Toast';
import { cn } from '@/shared/utils';
import { Pencil, Eye, Loader2 } from 'lucide-react';
import { Input } from '@/shared/components/Input';
import { Toggle } from '@/shared/components/Toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/Tooltip';
import { Note } from '@/shared/types';
import { useNotesContext } from '../context/notesContext';
import { useDebouncedCallback } from 'use-debounce';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownEditor from './MarkdownEditor';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface NoteEditorProps {
  note: Note;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const { saveNote, createEmbedding } = useNotesContext();

  const [localNote, setLocalNote] = useState(note);
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);
  const [indicatorStatus, setIndicatorStatus] = useState<'green' | 'yellow'>(
    'green'
  );

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const debouncedSaveContent = useDebouncedCallback(
    async (updatedNote: Note) => {
      setIsSaving(true);
      try {
        await saveNote(updatedNote);
        setError(null);
        setIndicatorStatus('green');
      } catch (err) {
        setError('Failed to save note. Please try again.');
        toast('Error saving note', {
          description:
            'An error occurred while saving the note. Please try again.',
        });
      } finally {
        setIsSaving(false);
      }
    },
    1000,
    { leading: false, trailing: true }
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setLocalNote((prev) => ({ ...prev, title: newTitle }));
      setIndicatorStatus('yellow');
      debouncedSaveContent({ ...localNote, title: newTitle });
    },
    [localNote, debouncedSaveContent]
  );

  const debouncedGenerateEmbedding = useDebouncedCallback(
    async () => {
      setIsGeneratingEmbedding(true);
      try {
        const success = await createEmbedding();
        if (success) {
          console.log('Embedding generated successfully');
        } else {
          console.error('Failed to generate embedding');
        }
      } catch (error) {
        console.error('Error generating embedding:', error);
      } finally {
        setIsGeneratingEmbedding(false);
      }
    },
    5000,
    { leading: false, trailing: true }
  );

  const handleContentChange = useCallback(
    (content: string) => {
      setLocalNote((prev) => {
        if (prev.content !== content) {
          const updatedNote = { ...prev, content };
          setIndicatorStatus('yellow');
          debouncedSaveContent(updatedNote);
          debouncedGenerateEmbedding();
          return updatedNote;
        }
        return prev;
      });
    },
    [debouncedSaveContent, debouncedGenerateEmbedding]
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center flex-grow mr-2">
          <Input
            type="text"
            value={localNote.title}
            onChange={handleTitleChange}
            placeholder="Note Title"
            className="text-2xl font-semibold border-none focus:ring-0 bg-background text-foreground flex-grow"
            aria-label="Note title"
          />
          {isSaving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </div>
        <div className="flex items-center space-x-2">
          {isGeneratingEmbedding && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-10 w-10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generating embedding...</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  indicatorStatus === 'green'
                    ? 'bg-green-500'
                    : 'bg-yellow-500 animate-pulse'
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {indicatorStatus === 'green'
                  ? 'Embedding up to date'
                  : 'Embedding needs update'}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={isEditing}
                onPressedChange={setIsEditing}
                aria-label="Toggle edit mode"
                className="h-10 w-10"
              >
                {isEditing ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isEditing
                  ? 'Switch to reading mode'
                  : 'Switch to editing mode'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        {isEditing ? (
          <MarkdownEditor
            value={localNote.content}
            onChange={handleContentChange}
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none border rounded-md p-4 h-full bg-muted/50 overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSanitize]}
            >
              {localNote.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default NoteEditor;
