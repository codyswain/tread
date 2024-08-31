import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";

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
  const [isEditing, setIsEditing] = useState(true);
  const [pythonResult, setPythonResult] = useState<string | null>(null);

  const handleRunPythonScript = async () => {
    try {
      const result = await window.electron.runPythonScript('hello_world', []);
      setPythonResult(result.result);
    } catch (error) {
      console.error('Error running Python script:', error);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onSave({
        ...note,
        title,
        content: editor.getHTML(),
      });
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
    setTitle(note.title);
  }, [note, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onSave({ ...note, title: newTitle });
  };

  const handleContentChange = useCallback(() => {
    if (editor) {
      onSave({
        ...note,
        title,
        content: editor.getHTML(),
      });
    }
  }, [editor, note, onSave, title]);

  useEffect(() => {
    if (editor) {
      editor.on("update", handleContentChange);
      return () => {
        editor.off("update", handleContentChange);
      };
    }
  }, [editor, handleContentChange]);
  const applyFormat = (format: string) => {
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
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-1">
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="text-2xl font-semibold border-none focus:ring-0 bg-background text-foreground flex-grow mr-2"
        />
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
      </div>
      {isEditing ? (
        <div
          className={cn(
            "border rounded-md p-4 min-h-[300px] bg-muted/50",
            "transition-shadow duration-200"
          )}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("bold")}
              className={
                editor?.isActive("bold")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("italic")}
              className={
                editor?.isActive("italic")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("underline")}
              className={
                editor?.isActive("underline")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("bulletList")}
              className={
                editor?.isActive("bulletList")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("orderedList")}
              className={
                editor?.isActive("orderedList")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("alignLeft")}
              className={
                editor?.isActive({ textAlign: "left" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("alignCenter")}
              className={
                editor?.isActive({ textAlign: "center" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("alignRight")}
              className={
                editor?.isActive({ textAlign: "right" })
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("codeBlock")}
              className={
                editor?.isActive("codeBlock")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("blockquote")}
              className={
                editor?.isActive("blockquote")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => applyFormat("highlight")}
              className={
                editor?.isActive("highlight")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </div>
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none"
          />
        </div>
      ) : (
        <div
          className="prose dark:prose-invert max-w-none border rounded-md p-4 min-h-[300px] bg-muted/50"
          dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
        />
      )}
      {/* <Button onClick={handleRunPythonScript}>DEV BUTTON ONLY - CLICK TO TEST PYTHON PROCESS EXECUTION</Button>
      {pythonResult && <p className="text-sm text-muted-foreground bg-white">Python Result: {pythonResult}</p>} */}
    </div>
  );
};

export default NoteEditor;