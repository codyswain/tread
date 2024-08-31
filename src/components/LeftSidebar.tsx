import React, { useState, useEffect, useRef } from "react";
import { Pencil, FolderPlus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FixedSizeList as List } from "react-window";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface LeftSidebarProps {
  isOpen: boolean;
  notes: Note[];
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onResize: (width: number) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  notes,
  isOpen,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onResize,
}) => {
  const [width, setWidth] = useState(256);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      if (newWidth >= 100 && newWidth <= 400) {
        setWidth(newWidth);
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (resizeRef.current) {
        resizeRef.current.classList.remove("bg-accent");
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize]);

  const startResizing = () => {
    isResizing.current = true;
    if (resizeRef.current) {
      resizeRef.current.classList.add("bg-accent");
    }
  };

  const renderNoteItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const note = notes[index];
    return (
      <div
        key={note.id}
        style={style}
        className={cn(
          "flex items-center justify-between py-2 px-3 rounded-md mb-1 cursor-pointer text-sm",
          selectedNote === note.id
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50"
        )}
        onClick={() => onSelectNote(note.id)}
      >
        <span className="truncate">{note.title}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNote(note.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed top-12 left-0 h-[calc(100vh-3rem)] bg-background border-r border-border transition-all duration-300 z-10 overflow-hidden",
        isOpen ? `w-[${width}px]` : "w-0"
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm">Files</span>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-1"
            onClick={onCreateNote}
            title="New Note"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => console.log("Create folder - to be implemented")}
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <List
        height={window.innerHeight - 48 - 40}
        itemCount={notes.length}
        itemSize={35}
        width={width}
      >
        {renderNoteItem}
      </List>
      <div className="absolute bottom-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => console.log("Open")}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={resizeRef}
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-accent/50"
      />
    </div>
  );
};

export default LeftSidebar;