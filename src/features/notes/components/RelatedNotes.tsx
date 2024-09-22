import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { ScrollArea } from "@/shared/components/ScrollArea";
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
import { NoteItem } from "./RelatedNoteListItem";

interface RelatedNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

const RelatedNotes: React.FC<RelatedNotesProps> = ({ isOpen, onClose }) => {
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [similarNotesIsLoading, setSimilarNotesIsLoading] =
    useState<boolean>(false);

  const { activeNote, openNote, directoryStructures } = useNotesContext();

  const findSimilarNotes = useCallback(async () => {
    if (!activeNote) {
      console.error("No active note");
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
          (note: SimilarNote) => note.id !== activeNote.id && note.score >= 0.5
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
    <div className="h-full flex flex-col bg-background border-l border-border w-full">
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm truncate mr-2">
          Related Notes
        </span>
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
      <ScrollArea className="flex flex-col w-full p-4">
        {similarNotesIsLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : similarNotes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {similarNotes.map((note) => 
                <div key={note.id} className="flex flex-col overflow-hidden">
                    {/* <div>
                      <h3 className="font-semibold truncate mr-2">{note.title}</h3>
                      <ScoreTooltip score={note.score} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {truncateContent(stripHtmlTags(note.content), 100)}
                    </div> */}

                   <NoteItem key={note.id} note={note} openNote={openNote} />
                </div>
              )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No similar notes found
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default RelatedNotes;
