import React, { useState, useEffect } from "react";
import NoteEditor from "../components/NoteEditor";
import LeftSidebar, { Note } from "../components/LeftSidebar";
import RightSidebar, { SimilarNote } from "../components/RightSidebar";
import TabBar from "../components/TabBar";
import { toast } from "@/components/ui/Toast";

// Start of Selection

interface DirectoryStructure {
  directories: { [key: string]: { notes: Note[] } };
  notes: Note[];
}

interface NotesProps {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

const Notes: React.FC<NotesProps> = ({
  isLeftSidebarOpen,
  isRightSidebarOpen,
  toggleLeftSidebar,
  toggleRightSidebar,
}) => {
  const [directoryStructure, setDirectoryStructure] =
    useState<DirectoryStructure>({ directories: {}, notes: [] });
  const [notes, setNotes] = useState<any[]>([]);
  const [openNotes, setOpenNotes] = useState<string[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const [splitScreen, setSplitScreen] = useState(false);
  const [secondaryNote, setSecondaryNote] = useState<string | null>(null);

  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([]);
  const [isSimilarNotesLoading, setIsSimilarNotesLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const loadedStructure = await window.electron.loadNotes();
      setDirectoryStructure(loadedStructure);
      const allNotes = [
        ...loadedStructure.notes,
        ...Object.values(loadedStructure.directories).flatMap(
          (dir) => dir.notes
        ),
      ];
      setNotes(allNotes);
      if (allNotes.length > 0) {
        setOpenNotes([allNotes[0].id]);
        setActiveNote(allNotes[0].id);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      // Consider adding user-friendly error handling here
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
    };
    try {
      await window.electron.saveNote(newNote);
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setOpenNotes((prevOpen) => [...prevOpen, newNote.id]);
      setActiveNote(newNote.id);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleSaveNote = async (updatedNote: any) => {
    try {
      await window.electron.saveNote(updatedNote);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        )
      );
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await window.electron.deleteNote(noteId);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      setOpenNotes((prevOpen) => prevOpen.filter((id) => id !== noteId));
      if (activeNote === noteId) {
        setActiveNote(openNotes[0] || null);
      }
      if (secondaryNote === noteId) {
        setSecondaryNote(null);
        setSplitScreen(false);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleCopyFilePath = async (noteId: string) => {
    try {
      const filePath = await window.electron.getNotePath(noteId);
      await navigator.clipboard.writeText(filePath);
      console.log("File path copied to clipboard:", filePath);
    } catch (error) {
      console.error("Error copying file path:", error);
    }
  };

  const handleTabClick = (noteId: string) => {
    setActiveNote(noteId);
  };

  const handleTabClose = (noteId: string) => {
    setOpenNotes((prevOpen) => prevOpen.filter((id) => id !== noteId));
    if (activeNote === noteId) {
      setActiveNote(openNotes[0] || null);
    }
    if (secondaryNote === noteId) {
      setSecondaryNote(null);
      setSplitScreen(false);
    }
  };

  const handleTabDragStart = (noteId: string, e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", noteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, target: "main" | "secondary") => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/plain");
    if (target === "secondary") {
      setSplitScreen(true);
      setSecondaryNote(noteId);
    } else {
      setActiveNote(noteId);
    }
  };

  const handleOpenNote = async (noteId: string) => {
    // Replace the active note instead of adding a new tab
    setActiveNote(noteId);
    setOpenNotes((prevOpen) => {
      if (prevOpen.includes(noteId)) {
        return prevOpen;
      }
      // Replace the active note in the openNotes array
      const activeIndex = prevOpen.indexOf(activeNote || "");
      if (activeIndex !== -1) {
        const newOpenNotes = [...prevOpen];
        newOpenNotes[activeIndex] = noteId;
        return newOpenNotes;
      }
      // If there's no active note, add the new note to the end
      return [...prevOpen, noteId];
    });
  };

  const handleOpenNoteInNewTab = (noteId: string) => {
    if (!openNotes.includes(noteId)) {
      setOpenNotes((prevOpen) => [...prevOpen, noteId]);
    }
    setActiveNote(noteId);
  };

  const findSimilarNotes = async (noteId: string) => {
    setIsSimilarNotesLoading(true);
    try {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        const similar = await handleFindSimilarNotes(note.content);
        setSimilarNotes(similar);
      } else {
        setSimilarNotes([]);
      }
    } catch (error) {
      console.error("Error finding similar notes:", error);
      setSimilarNotes([]);
      // Consider adding user-friendly error handling here
    } finally {
      setIsSimilarNotesLoading(false);
    }
  };

  const handleLeftSidebarResize = (width: number) => {
    setLeftSidebarWidth(width);
  };

  const handleRightSidebarResize = (width: number) => {
    setRightSidebarWidth(width);
  };

  const handleFindSimilarNotes = async (content: string) => {
    try {
      const similarNoteIds = await window.electron.findSimilarNotes(content);
      const uniqueNoteIds = [...new Set(similarNoteIds)];
      const similarNotes = uniqueNoteIds
        .filter((noteId) => noteId !== activeNote)
        .map((noteId) => {
          const note = notes.find((n) => n.id === noteId);
          return note
            ? {
                id: noteId,
                title: note.title || "Untitled",
                content: note.content || "",
              }
            : null;
        })
        .filter(Boolean);

      return similarNotes as SimilarNote[];
    } catch (error) {
      console.error("Error finding similar notes:", error);
      return [];
    }
  };

  const handleCreateDirectory = async (dirName: string) => {
    try {
      await window.electron.createDirectory(dirName);
      await loadNotes(); // Reload the directory structure
      toast("Directory created successfully", {
        description: `The directory "${dirName}" has been created.`,
      });
    } catch (error) {
      console.error("Error creating directory:", error);
      toast("Error creating directory", {
        description: "An error occurred while creating the directory. Please try again.",
      });
    }
  };
  
  const handleDeleteDirectory = async (dirName: string) => {
    if (confirm(`Are you sure you want to delete the directory "${dirName}" and all its contents?`)) {
      try {
        await window.electron.deleteDirectory(dirName);
        await loadNotes(); // Reload the directory structure
        toast("Directory deleted successfully", {
          description: `The directory "${dirName}" has been deleted.`,
        });
      } catch (error) {
        console.error("Error deleting directory:", error);
        toast("Error deleting directory", {
          description: "An error occurred while deleting the directory. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    if (activeNote && !isLoading) {
      findSimilarNotes(activeNote);
    }
  }, [activeNote, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        onCopyFilePath={handleCopyFilePath}
        directoryStructure={directoryStructure}
        selectedNote={activeNote}
        onSelectNote={handleOpenNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onResize={handleLeftSidebarResize}
        onClose={toggleLeftSidebar}
        onOpenNoteInNewTab={handleOpenNoteInNewTab}
        onCreateDirectory={handleCreateDirectory}
        onDeleteDirectory={handleDeleteDirectory}
      />
      <main
        className={`flex-grow flex flex-col overflow-hidden transition-all duration-300`}
        style={{
          marginLeft: isLeftSidebarOpen ? `${leftSidebarWidth}px` : "0",
          marginRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : "0",
        }}
      >
        <div className="flex-shrink-0">
          <TabBar
            tabs={openNotes.map((id) => ({
              id,
              title: notes.find((note) => note.id === id)?.title || "Untitled",
            }))}
            activeTab={activeNote || ""}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onTabDragStart={handleTabDragStart}
          />
        </div>
        <div className="flex-grow flex overflow-hidden">
          <div
            className="flex-1 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "main")}
          >
            {activeNote && (
              <NoteEditor
                note={
                  notes.find((note) => note.id === activeNote) || {
                    id: "",
                    title: "",
                    content: "",
                  }
                }
                onSave={handleSaveNote}
              />
            )}
          </div>
          {splitScreen && (
            <div
              className="flex-1 border-l border-border overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "secondary")}
            >
              {secondaryNote && (
                <NoteEditor
                  note={
                    notes.find((note) => note.id === secondaryNote) || {
                      id: "",
                      title: "",
                      content: "",
                    }
                  }
                  onSave={handleSaveNote}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onResize={handleRightSidebarResize}
        onClose={toggleRightSidebar}
        currentNoteId={activeNote || ""}
        currentNoteContent={
          notes.find((note) => note.id === activeNote)?.content || ""
        }
        onFindSimilarNotes={handleFindSimilarNotes}
        onOpenNote={handleOpenNote}
        isSimilarNotesLoading={isSimilarNotesLoading}
        similarNotes={similarNotes}
      />
    </div>
  );
};

export default Notes;
