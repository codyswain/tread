// src/features/notes/components/NoteEditor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@/shared/components/Toast';
import { cn } from '@/shared/utils';
import { Pencil, Eye, Loader2, Edit } from 'lucide-react';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
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
import DynamicMarkdownEditor from './DynamicMarkdownEditor';

interface NoteEditorProps {
  note: Note;
}

type EditorMode = 'dynamic' | 'edit' | 'view';

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const { saveNote, createEmbedding } = useNotesContext();

  const [localNote, setLocalNote] = useState(note);
  const [mode, setMode] = useState<EditorMode>('dynamic');
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

          {/* Mode Selector */}
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'dynamic' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setMode('dynamic')}
                  aria-label="Dynamic Edit/View Mode"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dynamic Edit/View Mode</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'edit' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setMode('edit')}
                  aria-label="Markdown Edit Mode"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Markdown Edit Mode</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'view' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setMode('view')}
                  aria-label="View Mode"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        {mode === 'dynamic' && (
          <DynamicMarkdownEditor
            value={localNote.content}
            onChange={handleContentChange}
          />
        )}
        {mode === 'edit' && (
          <MarkdownEditor
            value={localNote.content}
            onChange={handleContentChange}
          />
        )}
        {mode === 'view' && (
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
