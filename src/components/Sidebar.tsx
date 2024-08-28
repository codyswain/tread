import React from "react";
import { FaPlus } from "react-icons/fa";
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
            <Button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={cn(
                "w-full justify-start text-left font-normal mb-1",
                selectedNote === note.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-transparent hover:bg-accent/50"
              )}
              variant="ghost"
            >
              {note.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
