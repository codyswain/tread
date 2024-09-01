import React, { useState } from "react";
import { Pencil, FolderPlus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FixedSizeList as List } from "react-window";
import { useResizableSidebar } from "@/hooks/useResizableSidebar";
import ContextMenu from "./ContextMenu";
import { toast } from "@/components/ui/Toast";

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
  onClose: () => void;
  onCopyFilePath: (noteId: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  notes,
  isOpen,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onResize,
  onClose,
  onCopyFilePath
}) => {
  const { width, sidebarRef, startResizing } = useResizableSidebar({
    minWidth: 100,
    maxWidth: 400,
    defaultWidth: 256,
    isOpen,
    onResize,
    onClose,
    side: "left",
  });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && !event.defaultPrevented) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, noteId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateFolder = () => {
    toast("Create folder feature is not implemented yet", {
      description: "This feature will be available in a future update.",
    });
  };

  const handleSettingsClick = () => {
    toast("Settings feature is not implemented yet", {
      description: "This feature will be available in a future update.",
    });
  };

  const renderNoteItem = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
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
        onContextMenu={(e) => handleContextMenu(e, note.id)}
      >
        <span className="truncate">{note.title}</span>
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
       {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => onDeleteNote(contextMenu.noteId)}
          onClose={closeContextMenu}
          noteId={contextMenu.noteId}
          onCopyFilePath={onCopyFilePath}
        />
      )}
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
            onClick={handleCreateFolder}
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
          onClick={handleSettingsClick}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-accent/50"
        style={{ right: "-1px" }}
      />
    </div>
  );
};

export default LeftSidebar;