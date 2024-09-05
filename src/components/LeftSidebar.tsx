import React, { useState } from "react";
import {
  Pencil,
  FolderPlus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FixedSizeList as List } from "react-window";
import { useResizableSidebar } from "@/hooks/useResizableSidebar";
import ContextMenu from "./ContextMenu";
import { toast } from "@/components/ui/Toast";
import { Input } from "./ui/Input";

export interface Note {
  id: string;
  title: string;
  content: string;
}

interface Directory {
  notes: Note[];
}

interface DirectoryStructure {
  directories: { [key: string]: Directory };
  notes: Note[];
}

interface LeftSidebarProps {
  isOpen: boolean;
  directoryStructure: DirectoryStructure;
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onResize: (width: number) => void;
  onClose: () => void;
  onCopyFilePath: (noteId: string) => void;
  onOpenNoteInNewTab: (noteId: string) => void;
  onCreateDirectory: (dirName: string) => void;
  onDeleteDirectory: (dirName: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  directoryStructure,
  isOpen,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onResize,
  onClose,
  onCopyFilePath,
  onOpenNoteInNewTab,
  onCreateDirectory,
  onDeleteDirectory,
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
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && !event.defaultPrevented) {
        closeContextMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, noteId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const [newFolderName, setNewFolderName] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
  };

  const confirmCreateFolder = () => {
    if (newFolderName) {
      onCreateDirectory(newFolderName);
      setNewFolderName("");
    }
    setIsCreatingFolder(false);
  };

  const handleSettingsClick = () => {
    toast("Settings feature is not implemented yet", {
      description: "This feature will be available in a future update.",
    });
  };

  const renderNoteItem = (note: Note) => (
    <div
      key={note.id}
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

  const toggleDirectory = (dirPath: string) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dirPath)) {
        newSet.delete(dirPath);
      } else {
        newSet.add(dirPath);
      }
      return newSet;
    });
  };

  const renderDirectoryStructure = (
    structure: DirectoryStructure,
    currentPath: string[] = []
  ) => {
    return (
      <>
        {structure.directories && Object.entries(structure.directories).map(([dirName, dir]) => {
          const dirPath = [...currentPath, dirName].join("/");
          const isExpanded = expandedDirs.has(dirPath);
          return (
            <div key={dirPath} className="ml-4">
              <div
                className="flex items-center cursor-pointer hover:bg-accent/50 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDirectory(dirPath);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-1" />
                <span>{dirName}</span>
              </div>
              {isExpanded && (
                <div className="ml-4">
                  {renderDirectoryStructure(dir, [...currentPath, dirName])}
                  {dir.notes && dir.notes.map((note) => renderNoteItem(note))}
                </div>
              )}
            </div>
          );
        })}
        {structure.notes && structure.notes.map((note) => renderNoteItem(note))}
      </>
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
          onOpenNoteInNewTab={onOpenNoteInNewTab}
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
      {isCreatingFolder && (
        <div className="flex items-center mt-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="mr-2"
          />
          <Button onClick={confirmCreateFolder}>Create</Button>
          <Button variant="ghost" onClick={() => setIsCreatingFolder(false)}>
            Cancel
          </Button>
        </div>
      )}
      <div className="overflow-y-auto h-[calc(100%-2.5rem)]">
        {renderDirectoryStructure(directoryStructure)}
      </div>
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
