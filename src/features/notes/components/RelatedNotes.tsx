import React, { useEffect } from "react";
import { Button } from "@/shared/components/Button";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { cn } from "@/shared/utils";
import { Loader2, RefreshCw, Settings, Target, Zap } from "lucide-react";
import { toast } from "@/shared/components/Toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/Tooltip";
import { SimilarNote } from "@/shared/types";
import { useResizableSidebar } from "@/shared/hooks/useResizableSidebar";
import { useNotesContext } from "../context/notesContext";

interface RelatedNotesProps {
  isOpen: boolean;
  onResize: (width: number) => void;
  onClose: () => void;
}

const RelatedNotes: React.FC<RelatedNotesProps> = ({
  isOpen,
  onResize,
  onClose,
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
    findSimilarNotes,
    similarNotes,

    similarNotesIsLoading,

    activeNote,
    openNote,
  } = useNotesContext();

  const handleSettingsClick = () => {
    toast("Settings feature is not implemented yet", {
      description: "This feature will be available in a future update.",
    });
  };

  useEffect(() => {
    if (isOpen && activeNote) {
      findSimilarNotes();
    }
  }, [isOpen, activeNote, findSimilarNotes]);
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
        <Button
          variant="ghost"
          size="icon"
          onClick={findSimilarNotes}
          className="h-6 w-6"
          title="Refresh similar notes"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-4">
          {similarNotesIsLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {similarNotes.length > 0 ? (
                <ul>
                  {similarNotes.map((note) => (
                    <li
                      key={note.id}
                      className="cursor-pointer hover:bg-accent/10 p-2 rounded mb-2"
                      onClick={async () => {
                        openNote(note);
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold truncate mr-2">
                          {note.title}
                        </h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className={`text-sm font-medium flex items-center ${getScoreColor(
                                  note.score
                                )}`}
                              >
                                <Target className="h-3 w-3 mr-1 opacity-60" />
                                {note.score.toFixed(2)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Similarity score: {note.score.toFixed(2)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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
      </ScrollArea>
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

const getScoreColor = (score: number): string => {
  if (score >= 0.9) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.8) return "text-green-600 dark:text-green-400";
  if (score >= 0.7) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 0.6) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

export default RelatedNotes;
