import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import debounce from "lodash/debounce";
import { toast } from "@/shared/components/Toast";
import { cn } from "@/shared/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Highlighter,
  Pencil,
  Eye,
  Save,
  Loader2,
} from "lucide-react";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Toggle } from "@/shared/components/Toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/Tooltip";
import { Note } from "@/shared/types";
import { useNotesContext } from "../context/notesContext";

interface NoteEditorProps {
  note: Note;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const { activeNote, activeFileNode, saveNote, createEmbedding } =
    useNotesContext();

  const [localNote, setLocalNote] = useState(note);
  const [isEditing, setIsEditing] = useState(true);
  const [isSavingEmbedding, setIsSavingEmbedding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingEmbedding, setIsGeneratingEmbedding] = useState(false);
  const [indicatorStatus, setIndicatorStatus] = useState<
    "green" | "yellow" | "green"
  >("green");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
    setLocalNote(note);
  }, [editor, note]);

  const debouncedSaveContent = useMemo(
    () =>
      debounce(async (updatedNote: Note) => {
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
      }, 5000),
    [saveNote]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setLocalNote((prev) => ({ ...prev, title: newTitle }));
      setIndicatorStatus("yellow");
      saveNote({ ...localNote, title: newTitle }).catch((err) => {
        setError("Failed to save note title. Please try again.");
        toast("Error saving note title", {
          description:
            "An error occurred while saving the note title. Please try again.",
        });
      });
    },
    [localNote, saveNote]
  );

  const debouncedGenerateEmbedding = useMemo(
    () =>
      debounce(async () => {
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
      }, 5000),
    [createEmbedding]
  );

  const handleContentChange = useCallback(() => {
    if (editor) {
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
    }
  }, [editor, debouncedSaveContent, debouncedGenerateEmbedding]);

  const handleSaveEmbedding = useCallback(async () => {
    if (editor) {
      setIsSavingEmbedding(true);
      console.log("attempting to save embedding");
      const success = await createEmbedding();
      if (success) {
        toast("Embedding saved successfully", {
          description:
            "The note's embedding has been updated for similarity search.",
        });
      } else {
        toast("Error saving embedding", {
          description:
            "An error occurred while saving the embedding. Please try again.",
        });
      }
      setIsSavingEmbedding(false);
    }
  }, [editor, localNote.id]);

  useEffect(() => {
    if (editor) {
      editor.on("update", handleContentChange);
      return () => {
        editor.off("update", handleContentChange);
      };
    }
  }, [editor, handleContentChange]);

  const applyFormat = useCallback(
    (format: string) => {
      if (editor) {
        switch (format) {
          case "bold":
          case "italic":
          case "underline":
            editor.chain().focus().toggleMark(format).run();
            break;
          case "bulletList":
            editor.chain().focus().toggleBulletList().run();
            break;
          case "orderedList":
            editor.chain().focus().toggleOrderedList().run();
            break;
          case "codeBlock":
            editor.chain().focus().toggleCodeBlock().run();
            break;
          case "blockquote":
            editor.chain().focus().toggleBlockquote().run();
            break;
          case "highlight":
            editor.chain().focus().toggleHighlight().run();
            break;
          case "alignLeft":
          case "alignCenter":
          case "alignRight":
            editor
              .chain()
              .focus()
              .setTextAlign(format.replace("align", "").toLowerCase())
              .run();
            break;
        }
      }
    },
    [editor]
  );

  const toolbarButtons = useMemo(
    () => [
      { icon: Bold, format: "bold" },
      { icon: Italic, format: "italic" },
      { icon: UnderlineIcon, format: "underline" },
      { icon: List, format: "bulletList" },
      { icon: ListOrdered, format: "orderedList" },
      { icon: AlignLeft, format: "alignLeft" },
      { icon: AlignCenter, format: "alignCenter" },
      { icon: AlignRight, format: "alignRight" },
      { icon: Code, format: "codeBlock" },
      { icon: Quote, format: "blockquote" },
      { icon: Highlighter, format: "highlight" },
    ],
    []
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

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
                  ? "Switch to reading mode"
                  : "Switch to editing mode"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        {isEditing ? (
          <div
            className={cn(
              "border rounded-md p-4 h-full bg-muted/50",
              "transition-shadow duration-200 overflow-hidden flex flex-col"
            )}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {toolbarButtons.map(({ icon: Icon, format }) => (
                <Button
                  key={format}
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat(format)}
                  className={
                    editor.isActive(format)
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                  aria-label={`Toggle ${format}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <div className="flex-grow overflow-auto">
              <EditorContent
                editor={editor}
                className="prose dark:prose-invert max-w-none focus:outline-none h-full"
              />
            </div>
          </div>
        ) : (
          <div
            className="prose dark:prose-invert max-w-none border rounded-md p-4 h-full bg-muted/50 overflow-auto"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default NoteEditor;
