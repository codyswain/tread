import React from "react";
import { FaPlus } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface SidebarProps {
  notes: Note[];
  selectedNote: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}) => {
  return (
    <div className="w-64 bg-background border-r border-border h-full flex flex-col">
      <div className="p-4">
        <Button onClick={onCreateNote} className="w-full">
          <FaPlus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="px-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md mb-1 cursor-pointer",
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
                className="h-8 w-8"
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

export default Sidebar;