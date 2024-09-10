import React from "react";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { Loader, ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/Button";
import { cn, getFolderName } from "@/shared/utils";
import { DirectoryStructure } from "@/shared/types";
import { useNotesContext } from "../context/notesContext";

interface NoteExplorerContentProps {
  isLoadingFolders: boolean;
  loadError: string | null;
  directoryStructures: { [path: string]: DirectoryStructure };
  selectedFileNode: DirectoryStructure;
  onSelectNote: (file: DirectoryStructure) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    fileNode: DirectoryStructure
  ) => void;
  newFolderState: {
    isCreatingFolder: boolean;
    newFolderName: string;
    setNewFolderName: (name: string) => void;
    confirmCreateFolder: () => void;
    cancelCreateFolder: () => void;
    error: string | null;
  };
}

export const NoteExplorerContent: React.FC<NoteExplorerContentProps> = ({
  isLoadingFolders,
  loadError,
  directoryStructures,
  selectedFileNode,
  onSelectNote,
  handleContextMenu,
  newFolderState,
}) => {
  const { toggleDirectory, expandedDirs } = useNotesContext();

  const renderDirectoryStructure = (structure: DirectoryStructure) => {
    const fullPath = "/" + structure.fullPath.replace(/^\//, "");

    if (structure.type === "note") {
      return renderNote(structure);
    }

    return (
      <div key={fullPath}>
        {renderFolder(structure)}
        {expandedDirs.has(fullPath) && structure.children && (
          <div className="ml-4">
            {structure.children.map((child) => renderDirectoryStructure(child))}
          </div>
        )}
      </div>
    );
  };

  const renderFolder = (fileNode: DirectoryStructure) => {
    const isExpanded = expandedDirs.has(fileNode.fullPath);
    return (
      <div
        className="flex items-center cursor-pointer hover:bg-accent/50 py-1 px-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDirectory(fileNode);
        }}
        onContextMenu={(e) => handleContextMenu(e, fileNode)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-1" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1" />
        )}
        <Folder className="h-4 w-4 mr-1" />
        <span>{fileNode.name}</span>
      </div>
    );
  };

  const renderNote = (structure: DirectoryStructure) => (
    <div
      key={structure.fullPath}
      className={cn(
        "flex items-center py-1 px-2 rounded-md cursor-pointer text-sm",
        selectedFileNode === structure
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectNote(structure);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleContextMenu(e, structure);
      }}
    >
      <File className="h-4 w-4 mr-2" />
      <span className="truncate">{structure.name}</span>
    </div>
  );

  return (
    <ScrollArea className="h-[calc(100%-2.5rem)]">
      {newFolderState.isCreatingFolder && (
        <div className="flex items-center mt-2 p-2">
          <Input
            value={newFolderState.newFolderName}
            onChange={(e) => newFolderState.setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="mr-2"
          />
          <Button onClick={newFolderState.confirmCreateFolder}>Create</Button>
          <Button variant="ghost" onClick={newFolderState.cancelCreateFolder}>
            Cancel
          </Button>
        </div>
      )}
      {newFolderState.error && (
        <div className="text-red-500 text-sm p-2">{newFolderState.error}</div>
      )}
      <div className="p-2">
        {isLoadingFolders ? (
          <div className="flex items-center justify-center h-20">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-red-500 text-sm p-2">{loadError}</div>
        ) : Object.keys(directoryStructures).length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">
            No folders added yet.
          </div>
        ) : (
          Object.entries(directoryStructures).map(([path, fileNode]) => (
            <div key={path}>{renderDirectoryStructure(fileNode)}</div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
