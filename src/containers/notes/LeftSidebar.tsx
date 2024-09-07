import React, { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  FolderPlus,
  Settings,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  Plus,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useResizableSidebar } from "@/hooks/useResizableSidebar";
import ContextMenu from "./ContextMenu";
import { toast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { DirectoryStructure } from "@/types";
import { useFolderCreation } from "@/hooks/useFolderCreation";
import { ScrollArea } from "@/components/ui/ScrollArea";

interface LeftSidebarProps {
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
    itemId: string;
    itemType: "note" | "folder" | "topLevelFolder";
    dirPath: string;
  } | null>(null);

  const [topLevelFolders, setTopLevelFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isAddingTopLevelFolder, setIsAddingTopLevelFolder] = useState(false);
  const [newTopLevelFolderPath, setNewTopLevelFolderPath] = useState("");

  const {
    newFolderName,
    setNewFolderName,
    isCreatingFolder,
    handleCreateFolder,
    confirmCreateFolder,
    cancelCreateFolder,
    error: folderCreationError,
  } = useFolderCreation((folderName) =>
    onCreateDirectory(`${currentPath}/${folderName}`)
  );

  const loadTopLevelFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    setLoadError(null);
    try {
      const folders = await window.electron.getTopLevelFolders();
      setTopLevelFolders(folders || []); // Ensure it's always an array
    } catch (error) {
      console.error("Error loading top-level folders:", error);
      setLoadError("Failed to load folders. Please try again.");
      toast("Error loading folders", {
        description: "There was an error loading the top-level folders. Please try again.",
      });
      setTopLevelFolders([]); // Set to empty array in case of error
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  useEffect(() => {
    loadTopLevelFolders();
  }, [loadTopLevelFolders]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && !event.defaultPrevented) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, itemId: string, itemType: "note" | "folder" | "topLevelFolder", dirPath: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, itemId, itemType, dirPath });
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (contextMenu) {
      if (contextMenu.itemType === "note") {
        onDeleteNote(contextMenu.itemId, contextMenu.dirPath);
      } else if (contextMenu.itemType === "folder") {
        onDeleteDirectory(contextMenu.dirPath);
      } else if (contextMenu.itemType === "topLevelFolder") {
        window.electron.removeTopLevelFolder(contextMenu.dirPath);
        loadTopLevelFolders();
      }
      setContextMenu(null);
    }
  }, [contextMenu, onDeleteNote, onDeleteDirectory, loadTopLevelFolders]);

  const handleAddTopLevelFolder = useCallback(async () => {
    if (newTopLevelFolderPath.trim()) {
      try {
        await window.electron.addTopLevelFolder(newTopLevelFolderPath.trim());
        setNewTopLevelFolderPath("");
        setIsAddingTopLevelFolder(false);
        loadTopLevelFolders();
      } catch (error) {
        console.error("Error adding top-level folder:", error);
        toast("Error adding folder", {
          description: "There was an error adding the top-level folder. Please try again.",
        });
      }
    }
  }, [newTopLevelFolderPath, loadTopLevelFolders]);

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

  const renderDirectoryStructure = useCallback((structure: DirectoryStructure, currentPath = "") => {
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
            {structure.children.map((child) => renderDirectoryStructure(child, fullPath))}
          </div>
        )}
      </div>
    );
  }, [expandedDirs, selectedNote, onSelectNote, handleContextMenu, toggleDirectory]);

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
          {...contextMenu}
          onDelete={handleDelete}
          onCreateFile={() => contextMenu && onCreateNote(contextMenu.dirPath)}
          onCreateFolder={handleCreateFolder}
          onClose={() => setContextMenu(null)}
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
            className="h-8 w-8 mr-1"
            onClick={() => {
              setCurrentPath("");
              handleCreateFolder();
            }}
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsAddingTopLevelFolder(true)}
            title="Add Top-Level Folder"
          >
            <Plus className="h-4 w-4" />
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
      {isAddingTopLevelFolder && (
        <div className="flex items-center mt-2 p-2">
          <Input
            value={newTopLevelFolderPath}
            onChange={(e) => setNewTopLevelFolderPath(e.target.value)}
            placeholder="Folder path"
            className="mr-2"
          />
          <Button onClick={handleAddTopLevelFolder}>Add</Button>
          <Button variant="ghost" onClick={() => setIsAddingTopLevelFolder(false)}>
            Cancel
          </Button>
        </div>
      )}
      {folderCreationError && <div className="text-red-500 text-sm p-2">{folderCreationError}</div>}
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div className="p-2">
          {isLoadingFolders ? (
            <div className="flex items-center justify-center h-20">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : loadError ? (
            <div className="text-red-500 text-sm p-2">{loadError}</div>
          ) : topLevelFolders.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2">No top-level folders added yet.</div>
          ) : (
            topLevelFolders.map((folderPath) => (
              <div
                key={folderPath}
                className="flex items-center cursor-pointer hover:bg-accent/50 py-1 px-2"
                onClick={() => toggleDirectory(folderPath)}
                onContextMenu={(e) =>
                  handleContextMenu(e, folderPath, "topLevelFolder", folderPath)
                }
              >
                {expandedDirs.has(folderPath) ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-1" />
                <span className="text-sm">{folderPath}</span>
              </div>
            ))
          )}
        </div>
        <div className="p-2">
          {renderDirectoryStructure(directoryStructure)}
        </div>
      </ScrollArea>
      <div className="absolute bottom-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toast("Settings feature is not implemented yet")}
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