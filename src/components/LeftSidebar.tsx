import React from "react";
import { Pencil, FolderPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";

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
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  notes,
  isOpen,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}) => {
  return (
    <div className={`fixed top-12 left-0 h-[calc(100vh-3rem)] bg-background border-r border-border transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
      <div className="flex justify-end items-center p-2 h-10"> {/* New container for icons */}
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
          onClick={() => console.log("Create folder - to be implemented")}
          title="New Folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]"> {/* Adjusted height */}
        <div className="px-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "flex items-center justify-between py-2 px-3 rounded-md mb-1 cursor-pointer text-sm",
                selectedNote === note.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSelectNote(note.id)}
            >
              <span className="truncate">{note.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LeftSidebar;