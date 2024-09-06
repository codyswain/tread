import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  FolderPlus,
  Settings,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useResizableSidebar } from "@/hooks/useResizableSidebar";
import ContextMenu from "./ContextMenu";
import { toast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { DirectoryStructure, Note } from "@/types";
import { useFolderCreation } from "@/hooks/useFolderCreation";

const LeftSidebar: React.FC<{
  isOpen: boolean;
  directoryStructure: DirectoryStructure;
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (dirPath: string) => void;
  onDeleteNote: (id: string, dirPath: string) => void;
  onResize: (width: number) => void;
  onClose: () => void;
  onCopyFilePath: (noteId: string) => void;
  onOpenNoteInNewTab: (noteId: string) => void;
  onCreateDirectory: (dirPath: string) => void;
  onDeleteDirectory: (dirPath: string) => void;
}> = ({
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
    itemId: string;
    itemType: "note" | "folder";
    dirPath: string;
  } | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>("");

  const {
    newFolderName,
    setNewFolderName,
    isCreatingFolder,
    setIsCreatingFolder,
    handleCreateFolder,
    confirmCreateFolder,
    cancelCreateFolder,
    error,
  } = useFolderCreation((folderName) =>
    onCreateDirectory(`${currentPath}/${folderName}`)
  );

  useEffect(() => {
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

  const handleContextMenu = useCallback(
    (
      e: React.MouseEvent,
      itemId: string,
      itemType: "note" | "folder" | "empty",
      dirPath: string
    ) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, itemId, itemType, dirPath });
    },
    []
  );

  const handleCreateFile = useCallback(() => {
    if (contextMenu) {
      onCreateNote(contextMenu.dirPath);
    }
  }, [contextMenu, onCreateNote]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleSettingsClick = () => {
    toast("Settings feature is not implemented yet", {
      description: "This feature will be available in a future update.",
    });
  };

  const toggleDirectory = useCallback((dirPath: string) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dirPath)) {
        newSet.delete(dirPath);
      } else {
        newSet.add(dirPath);
      }
      return newSet;
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (contextMenu) {
      if (contextMenu.itemType === "note") {
        onDeleteNote(contextMenu.itemId, contextMenu.dirPath);
      } else {
        onDeleteDirectory(contextMenu.dirPath);
      }
      closeContextMenu();
    }
  }, [contextMenu, onDeleteNote, onDeleteDirectory, closeContextMenu]);

  const renderDirectoryStructure = useMemo(() => {
    const render = (structure: DirectoryStructure, currentPath = "") => {
      const fullPath = `${currentPath}/${structure.name}`.replace(/^\//, "");
      const isExpanded = expandedDirs.has(fullPath);

      if (structure.type === "note") {
        return (
          <div
            key={structure.note!.id}
            className={cn(
              "flex items-center py-1 px-2 rounded-md cursor-pointer text-sm",
              selectedNote === structure.note!.id
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            )}
            onClick={() => onSelectNote(structure.note!.id)}
            onContextMenu={(e) =>
              handleContextMenu(e, structure.note!.id, "note", currentPath)
            }
          >
            <File className="h-4 w-4 mr-2" />
            <span className="truncate">{structure.name}</span>
          </div>
        );
      }

      return (
        <div key={fullPath}>
          <div
            className="flex items-center cursor-pointer hover:bg-accent/50 py-1 px-2"
            onClick={() => toggleDirectory(fullPath)}
            onContextMenu={(e) =>
              handleContextMenu(e, structure.name, "folder", fullPath)
            }
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <Folder className="h-4 w-4 mr-1" />
            <span>{structure.name}</span>
          </div>
          {isExpanded && structure.children && (
            <div className="ml-4">
              {structure.children.map((child) => render(child, fullPath))}
            </div>
          )}
        </div>
      );
    };

    return render;
  }, [
    expandedDirs,
    selectedNote,
    onSelectNote,
    handleContextMenu,
    toggleDirectory
  ]);

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
          onDelete={handleDelete}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          itemId={contextMenu.itemId}
          itemType={contextMenu.itemType}
          dirPath={contextMenu.dirPath}
          onClose={closeContextMenu}
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
            onClick={() => onCreateNote("")}
            title="New Note"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setCurrentPath("");
              handleCreateFolder();
            }}
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isCreatingFolder && (
        <div className="flex items-center mt-2 p-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="mr-2"
          />
          <Button onClick={confirmCreateFolder}>Create</Button>
          <Button variant="ghost" onClick={cancelCreateFolder}>
            Cancel
          </Button>
        </div>
      )}
      {error && <div className="text-red-500 text-sm p-2">{error}</div>}
      <div className="overflow-y-auto h-[calc(100%-2.5rem)] p-2">
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
