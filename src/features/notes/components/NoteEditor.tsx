import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/components/Toast";
import { cn } from "@/shared/utils";
import { Loader2 } from "lucide-react";
import { Input } from "@/shared/components/Input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/Tooltip";
import { Note } from "@/shared/types";
import { useNotesContext } from "../context/notesContext";
import { useDebouncedCallback } from "use-debounce";
import "katex/dist/katex.min.css";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Placeholder } from "@tiptap/extension-placeholder";
import Toolbar from "./Toolbar";

interface NoteEditorProps {
  note: Note;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const { saveNote, createEmbedding } = useNotesContext();

  const [localNote, setLocalNote] = useState(note);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);
  const [indicatorStatus, setIndicatorStatus] = useState<"green" | "yellow">(
    "green"
  );

  useEffect(() => {
    setLocalNote(note);
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || "");
    }
  }, [note]);

  const debouncedSaveContent = useDebouncedCallback(
    async (updatedNote: Note) => {
      setIsSaving(true);
      try {
        await saveNote(updatedNote);
        setError(null);
        setIndicatorStatus("green");
      } catch (err) {
        setError("Failed to save note. Please try again.");
        toast("Error saving note", {
          description:
            "An error occurred while saving the note. Please try again.",
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
      setIndicatorStatus("yellow");
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
          console.log("Embedding generated successfully");
        } else {
          console.error("Failed to generate embedding");
        }
      } catch (error) {
        console.error("Error generating embedding:", error);
      } finally {
        setIsGeneratingEmbedding(false);
      }
    },
    5000,
    { leading: false, trailing: true }
  );

  const handleContentChange = useCallback(
    ({ editor }: { editor: any }) => {
      const content = editor.getHTML();
      setLocalNote((prev) => {
        if (prev.content !== content) {
          const updatedNote = { ...prev, content };
          setIndicatorStatus("yellow");
          debouncedSaveContent(updatedNote);
          debouncedGenerateEmbedding();
          return updatedNote;
        }
        return prev;
      });
    },
    [debouncedSaveContent, debouncedGenerateEmbedding]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: "Start typing your note...",
      }),
    ],
    content: localNote.content || "",
    onUpdate: handleContentChange,
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "prose-sm dark:prose-invert focus:outline-none max-w-none h-full overflow-auto leading-normal prose-p:mt-0 prose-p:mb-0",
      },
    },
  });

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
                  "w-2 h-2 rounded-full",
                  indicatorStatus === "green"
                    ? "bg-green-500"
                    : "bg-yellow-500 animate-pulse"
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {indicatorStatus === "green"
                  ? "Embedding up to date"
                  : "Embedding needs update"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Toolbar editor={editor} />
      <div className="flex-grow overflow-auto">
        <div className="max-w-3xl h-full mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <EditorContent editor={editor} />
        </div>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default NoteEditor;
