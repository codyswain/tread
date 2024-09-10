import React from "react";
import { Settings } from "lucide-react";
import { useResizableSidebar } from "@/shared/hooks/useResizableSidebar";
import { Button } from "@/shared/components/Button";
import { toast } from "@/shared/components/Toast";
import { cn } from "@/shared/utils";
import { useTopLevelFolders } from "../hooks/useNoteExplorerTopLevelFolder";
import { useNoteExplorerContextMenu } from "../hooks/useNoteExplorerContextMenu";
import { NoteExplorerHeader } from "./NoteExplorerHeader";
import NoteExplorerContextMenu from "./NoteExplorerContextMenu";
import { NoteExplorerContent } from "./NoteExplorerContent";
import { useNotesContext } from "../context/notesContext";

interface NoteExplorerProps {
  isOpen: boolean;
  onResize: (width: number) => void;
  onClose: () => void;
}

const NoteExplorer: React.FC<NoteExplorerProps> = ({
  isOpen,
  onResize,
  onClose
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

  const { isLoadingFolders, loadError, handleAddTopLevelFolder } = useTopLevelFolders();
  const { contextMenu, handleContextMenu, closeContextMenu } = useNoteExplorerContextMenu();
  const {
    directoryStructures,
    createNote,
    activeFileNode,
    setActiveFileNode,
    deleteFileNode,
    handleCreateFolder,
    expandedDirs,
    toggleDirectory,
    newFolderState
  } = useNotesContext();

  const handleDelete = () => {
    if (contextMenu.fileNode) {
      deleteFileNode(contextMenu.fileNode)
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
        onCreateFile={() => contextMenu && createNote(contextMenu.dirPath)}
        onCreateFolder={handleCreateFolder}
        onCopyFilePath={() => {console.log('IMPLEMENT COPY FILE PATH')}}
        onOpenNoteInNewTab={() => {console.log('IMPLEMENT OPEN NOTE IN NEW TAB')}}
      />
      <NoteExplorerHeader
        onCreateNote={() => console.log('IMPLEMENT CREATE NEW NOTE')}
        onCreateFolder={() => {console.log('IMPLEMENT CREATE NEW FOLDER')}}
        onAddTopLevelFolder={handleAddTopLevelFolder}
      />
      <NoteExplorerContent
        isLoadingFolders={isLoadingFolders}
        loadError={loadError}
        directoryStructures={directoryStructures}
        expandedDirs={expandedDirs}
        selectedFileNode={activeFileNode}
        onSelectNote={setActiveFileNode}
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