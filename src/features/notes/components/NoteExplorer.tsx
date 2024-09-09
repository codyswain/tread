import React, { useEffect } from "react";
import { Settings } from "lucide-react";
import { useResizableSidebar } from "@/shared/hooks/useResizableSidebar";
import { Button } from "@/shared/components/Button";
import { toast } from "@/shared/components/Toast";
import { cn } from "@/shared/utils";
import { DirectoryStructure, DirectoryStructures, Note } from "@/shared/types";
import { useNoteExplorerState } from "../hooks/useNoteExplorerState";
import { useTopLevelFolders } from "../hooks/useNoteExplorerTopLevelFolder";
import { useNoteExplorerContextMenu } from "../hooks/useNoteExplorerContextMenu";
import { NoteExplorerHeader } from "./NoteExplorerHeader";
import NoteExplorerContextMenu from "./NoteExplorerContextMenu";
import { NoteExplorerContent } from "./NoteExplorerContent";

interface NoteExplorerProps {
  isOpen: boolean;
  directoryStructures: DirectoryStructures;
  selectedFileNode: DirectoryStructure;
  onSelectNote: (file: DirectoryStructure) => void;
  onCreateNote: (dirPath: string) => void;
  onDelete: (fileNode: DirectoryStructure) => void;
  onResize: (width: number) => void;
  onClose: () => void;
  onCopyFilePath: (noteId: string) => void;
  onOpenNoteInNewTab: (noteId: string) => void;
  onCreateDirectory: (dirPath: string) => void;
  onDeleteDirectory: (dirPath: string) => void;
}

const NoteExplorer: React.FC<NoteExplorerProps> = ({
  directoryStructures,
  isOpen,
  selectedFileNode,
  onSelectNote,
  onCreateNote,
  onDelete,
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

  const {
    expandedDirs,
    toggleDirectory,
    currentPath,
    setCurrentPath,
    handleCreateFolder,
    newFolderState,
  } = useNoteExplorerState(onCreateDirectory);

  const {
    isLoadingFolders,
    loadError,
    handleAddTopLevelFolder,
  } = useTopLevelFolders();

  const { contextMenu, handleContextMenu, closeContextMenu } = useNoteExplorerContextMenu();

  const handleDelete = () => {
    if (contextMenu.fileNode){
      onDelete(contextMenu.fileNode)
    }
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed top-12 left-0 h-[calc(100vh-3rem)] bg-background border-r border-border transition-all duration-300 z-10 overflow-hidden",
        isOpen ? `w-[${width}px]` : "w-0"
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <NoteExplorerContextMenu
        contextMenu={contextMenu}
        onClose={closeContextMenu}
        onDelete={handleDelete}
        onCreateFile={() => contextMenu && onCreateNote(contextMenu.dirPath)}
        onCreateFolder={handleCreateFolder}
        onCopyFilePath={onCopyFilePath}
        onOpenNoteInNewTab={onOpenNoteInNewTab}
      />
      <NoteExplorerHeader
        onCreateNote={() => onCreateNote("")}
        onCreateFolder={() => {
          setCurrentPath("");
          handleCreateFolder();
        }}
        onAddTopLevelFolder={handleAddTopLevelFolder}
      />
      <NoteExplorerContent
        isLoadingFolders={isLoadingFolders}
        loadError={loadError}
        directoryStructures={directoryStructures}
        expandedDirs={expandedDirs}
        selectedFileNode={selectedFileNode}
        onSelectNote={onSelectNote}
        toggleDirectory={toggleDirectory}
        handleContextMenu={handleContextMenu}
        newFolderState={newFolderState}
      />
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

export default NoteExplorer;