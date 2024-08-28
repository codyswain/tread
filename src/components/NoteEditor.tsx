import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
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
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";

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
    <div className="flex flex-col h-full bg-background text-foreground">
      <Input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note Title"
        className="text-2xl font-semibold border-none focus:ring-0 mb-4 bg-background text-foreground"
      />
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="border-none p-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("bold")}
              className={editor?.isActive("bold") ? "bg-accent" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("italic")}
              className={editor?.isActive("italic") ? "bg-accent" : ""}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("underline")}
              className={editor?.isActive("underline") ? "bg-accent" : ""}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("bulletList")}
              className={editor?.isActive("bulletList") ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("orderedList")}
              className={editor?.isActive("orderedList") ? "bg-accent" : ""}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("alignLeft")}
              className={
                editor?.isActive({ textAlign: "left" }) ? "bg-accent" : ""
              }
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("alignCenter")}
              className={
                editor?.isActive({ textAlign: "center" }) ? "bg-accent" : ""
              }
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("alignRight")}
              className={
                editor?.isActive({ textAlign: "right" }) ? "bg-accent" : ""
              }
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("codeBlock")}
              className={editor?.isActive("codeBlock") ? "bg-accent" : ""}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("blockquote")}
              className={editor?.isActive("blockquote") ? "bg-accent" : ""}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => applyFormat("highlight")}
              className={editor?.isActive("highlight") ? "bg-accent" : ""}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </div>
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none"
          />
        </TabsContent>
        <TabsContent value="preview" className="border-none p-0">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoteEditor;