import React from "react";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { Loader, ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/Button";
import { cn, getFolderName } from "@/shared/utils/utils";
import { DirectoryStructure } from "@/shared/types";

interface NoteExplorerContentProps {
  isLoadingFolders: boolean;
  loadError: string | null;
  topLevelFolders: string[];
  directoryStructure: DirectoryStructure;
  expandedDirs: Set<string>;
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
  toggleDirectory: (dirPath: string) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    itemId: string,
    itemType: "note" | "folder" | "topLevelFolder",
    dirPath: string
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
  topLevelFolders,
  directoryStructure,
  expandedDirs,
  selectedNote,
  onSelectNote,
  toggleDirectory,
  handleContextMenu,
  newFolderState,
}) => {
  const renderDirectoryStructure = (
    structure: DirectoryStructure,
    currentPath = ""
  ) => {
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectNote(structure.note!.id);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleContextMenu(e, structure.note!.id, "note", currentPath);
          }}
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
            {structure.children.map((child) =>
              renderDirectoryStructure(child, fullPath)
            )}
          </div>
        )}
      </div>
    );
  };

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
        ) : topLevelFolders.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">
            No top-level folders added yet.
          </div>
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
              <span className="text-sm" title={folderPath}>
                {getFolderName(folderPath)}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="p-2">{renderDirectoryStructure(directoryStructure)}</div>
    </ScrollArea>
  );
};
