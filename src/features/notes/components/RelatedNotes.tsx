import React from 'react';
import { Button } from "@/shared/components/Button";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { cn } from "@/shared/utils";
import { Loader2, Settings } from "lucide-react";
import { toast } from "@/shared/components/Toast";
import { SimilarNote } from "@/shared/types";
import { useResizableSidebar } from '@/shared/hooks/useResizableSidebar';
import { useNotesContext } from '../context/notesContext';

interface RelatedNotesProps {
  isOpen: boolean;
  onResize: (width: number) => void;
  onClose: () => void;
}

const RelatedNotes: React.FC<RelatedNotesProps> = ({
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
    side: "right",
  });

  const {
    directoryStructures,
    createNote,
    activeFileNode,
    setActiveFileNode,
    deleteFileNode,
    handleCreateFolder,
    expandedDirs,
    toggleDirectory,
    newFolderState,

    findSimilarNotes,
    similarNotes,
  } = useNotesContext();

  // const handleOpenNote = (noteId: string) => {
  //   onOpenNote(noteId);
  // };

  const handleSettingsClick = () => {
    toast("Settings feature is not implemented yet", {
      description: "This feature will be available in a future update.",
    });
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed top-12 right-0 h-[calc(100vh-3rem)] bg-background border-l border-border transition-all duration-300 z-10 overflow-hidden",
        isOpen ? `w-[${width}px]` : "w-0"
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm">Related Notes</span>
      </div>

      <Button
          variant="ghost"
          size="sm"
          onClick={findSimilarNotes}
          className="text-xs"
        >
          Find Similar
        </Button>
        {
          similarNotes.length > 0 && 
          <ul>
            {similarNotes.map((note) => (
              <li
                key={note.id}
                className="cursor-pointer hover:bg-accent/10 p-2 rounded"
                onClick={() => {}}
              >
                
                <h3 className="font-semibold mb-1">{note.title}</h3>
                <p className="text-green-500 text-sm">Score: {note.score}</p>
                <div
                  className="text-sm text-muted-foreground prose dark:prose-invert max-w-none line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </li>
            ))}
          </ul>
        }
      {/* <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-4">
          {isSimilarNotesLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {similarNotes.length > 0 ? (
                <ul className="space-y-4">
                  {similarNotes.map((note) => (
                    <li
                      key={note.id}
                      className="cursor-pointer hover:bg-accent/10 p-2 rounded"
                      onClick={() => handleOpenNote(note.)}
                    >
                      <h3 className="font-semibold mb-1">{note.title}</h3>
                      <div
                        className="text-sm text-muted-foreground prose dark:prose-invert max-w-none line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No similar notes found</p>
              )}
            </>
          )}
        </div>
      </ScrollArea> */}
      <div className="absolute bottom-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSettingsClick}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:bg-accent/50"
      />
    </div>
  );
};

export default RelatedNotes;