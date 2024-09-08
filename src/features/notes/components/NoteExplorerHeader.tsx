import React from "react";
import { Button } from "@/shared/components/Button";
import { Pencil, FolderPlus, Plus } from "lucide-react";

interface NoteExplorerHeaderProps {
  onCreateNote: () => void;
  onCreateFolder: () => void;
  onAddTopLevelFolder: () => void;
}

export const NoteExplorerHeader: React.FC<NoteExplorerHeaderProps> = ({
  onCreateNote,
  onCreateFolder,
  onAddTopLevelFolder,
}) => {
  return (
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
          className="h-8 w-8 mr-1"
          onClick={onCreateFolder}
          title="New Folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onAddTopLevelFolder}
          title="Add Top-Level Folder"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};