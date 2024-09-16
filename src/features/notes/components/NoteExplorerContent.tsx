// src/features/notes/components/NoteExplorerContent.tsx

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { Loader, ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/Button";
import { cn } from "@/shared/utils";
import { DirectoryStructures, FileNode } from "@/shared/types";
import { useNotesContext } from "../context/notesContext";

interface NoteExplorerContentProps {
  isLoadingFolders: boolean;
  loadError: string | null;
  directoryStructures: DirectoryStructures;
  selectedFileNode: FileNode | null;
  onSelectNote: (file: FileNode) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    fileNode: FileNode
  ) => void;
}

export const NoteExplorerContent: React.FC<NoteExplorerContentProps> = ({
  isLoadingFolders,
  loadError,
  directoryStructures,
  selectedFileNode,
  onSelectNote,
  handleContextMenu,
}) => {
  const { toggleDirectory, expandedDirs, setActiveFileNodeId, activeFileNodeId } = useNotesContext();
  const { newFolderState } = useNotesContext();

  const activeFileNode = activeFileNodeId ? directoryStructures.nodes[activeFileNodeId] : null;

  // For the folder that renders when creating a new folder
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (newFolderState.isCreatingFolder) {
      newFolderInputRef.current?.focus();
    }
  }, [newFolderState.isCreatingFolder]);
  const handleNewFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      newFolderState.confirmCreateFolder();
    } else if (e.key === 'Escape') {
      newFolderState.cancelCreateFolder();
    }
  };

  const renderFileNode = (nodeId: string, depth = 0) => {
    const node = directoryStructures.nodes[nodeId];
    if (!node) return null;

    const isExpanded = expandedDirs.has(node.id);
    const isSelected = selectedFileNode?.id === node.id;

    if (node.type === "directory") {
      return (
        <div key={node.id}>
          <div
            className="flex items-center cursor-pointer hover:bg-accent/50 py-1 px-2"
            style={{ marginLeft: depth * 16 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleDirectory(node);
            }}
            onContextMenu={(e) => handleContextMenu(e, node)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <Folder className="h-4 w-4 mr-1" />
            <span>{node.name}</span>
          </div>
          {isExpanded && node.childIds && node.childIds.map((childId) => renderFileNode(childId, depth + 1))}
          {newFolderState.isCreatingFolder &&
            selectedFileNode?.id === node.id && (
              <div className="ml-4 px-2 py-1">
                <Input
                  variant="minimal"
                  ref={newFolderInputRef}
                  value={newFolderState.newFolderName}
                  onChange={(e) => newFolderState.setNewFolderName(e.target.value)}
                  onKeyDown={handleNewFolderKeyDown}
                  onBlur={newFolderState.cancelCreateFolder}
                  placeholder="New folder name"
                  className="w-full"
                />
              </div>
            )}
        </div>
      );
    } else if (node.type === "note") {
      return (
        <div
          key={node.id}
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer text-sm",
            isSelected
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50"
          )}
          style={{ marginLeft: depth * 16 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveFileNodeId(node.id);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleContextMenu(e, node);
          }}
        >
          <File className="h-4 w-4 mr-2" />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <ScrollArea className="h-[calc(100%-2.5rem)]">
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
        ) : directoryStructures.rootIds.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">
            No folders added yet.
          </div>
        ) : (
          directoryStructures.rootIds.map((rootId) => renderFileNode(rootId))
        )}
      </div>
    </ScrollArea>
  );
};
