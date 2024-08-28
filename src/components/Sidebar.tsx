import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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

const Sidebar: React.FC<SidebarProps> = ({ notes, selectedNote, onSelectNote, onCreateNote, onDeleteNote }) => {
  return (
    <div className="w-64 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full flex flex-col">
      <div className="p-4">
        <Button onClick={onCreateNote} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
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
                "w-full justify-start text-left font-normal mb-1 hover:bg-zinc-200 dark:hover:bg-zinc-800",
                selectedNote === note.id ? "bg-zinc-200 dark:bg-zinc-800" : "bg-transparent"
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