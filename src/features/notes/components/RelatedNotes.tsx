import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { cn } from "@/shared/utils";
import { Loader2, RefreshCw, Target } from "lucide-react";
import { toast } from "@/shared/components/Toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/Tooltip";
import { SimilarNote } from "@/shared/types";
import { useNotesContext } from "../context/notesContext";

interface RelatedNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

const RelatedNotes: React.FC<RelatedNotesProps> = ({ isOpen, onClose }) => {
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [similarNotesIsLoading, setSimilarNotesIsLoading] = useState<boolean>(false);

  const {
    activeNote,
    openNote,
    directoryStructures
  } = useNotesContext();

  const findSimilarNotes = useCallback(async () => {
    if (!activeNote) {
      console.error('No active note');
      setSimilarNotes([]);
      setSimilarNotesIsLoading(false);
      return;
    }
    setSimilarNotesIsLoading(true);
    try {
      const similarNotes = await window.electron.findSimilarNotes(
        activeNote.content,
        directoryStructures
      );
      setSimilarNotes(
        similarNotes.filter(
          (note: SimilarNote) => note.id !== activeNote.id && note.score >= 0.8
        )
      );
    } catch (error) {
      console.error("Error finding similar notes:", error);
      toast("Failed to find similar notes", {
        description: "An error occurred while searching for similar notes.",
      });
      setSimilarNotes([]);
    } finally {
      setSimilarNotesIsLoading(false);
    }
  }, [activeNote?.id]);

  useEffect(() => {
    if (isOpen && activeNote) {
      findSimilarNotes();
    }
  }, [isOpen, activeNote?.id, findSimilarNotes]);

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm truncate mr-2">Related Notes</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={findSimilarNotes}
          className="h-6 w-6 flex-shrink-0"
          title="Refresh similar notes"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4">
          {similarNotesIsLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : similarNotes.length > 0 ? (
            <ul className="space-y-4">
              {similarNotes.map((note) => (
                <NoteItem key={note.id} note={note} openNote={openNote} />
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground">No similar notes found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const NoteItem: React.FC<{ note: SimilarNote; openNote: (note: SimilarNote) => void }> = ({ note, openNote }) => {
  return (
    <li
      className="cursor-pointer hover:bg-accent/10 p-3 rounded transition-colors duration-200"
      onClick={() => openNote(note)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold truncate mr-2 flex-grow">{note.title}</h3>
        <ScoreTooltip score={note.score} />
      </div>
      <div
        className="text-sm text-muted-foreground prose dark:prose-invert max-w-full break-words overflow-hidden"
      >
        {truncateContent(note.content, 150)}
      </div>
    </li>
  );
};

const ScoreTooltip: React.FC<{ score: number }> = ({ score }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <span className={`text-sm font-medium flex items-center flex-shrink-0 ${getScoreColor(score)}`}>
          <Target className="h-3 w-3 mr-1 opacity-60" />
          {score.toFixed(2)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Similarity score: {score.toFixed(2)}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const getScoreColor = (score: number): string => {
  if (score >= 0.9) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.8) return "text-green-600 dark:text-green-400";
  if (score >= 0.7) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 0.6) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const truncateContent = (content: string, maxLength: number): string => {
  const strippedContent = content.replace(/<[^>]*>/g, '');
  if (strippedContent.length <= maxLength) return strippedContent;
  return strippedContent.slice(0, maxLength) + '...';
};

export default RelatedNotes;