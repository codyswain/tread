import React, { useState, useEffect } from "react";
import NoteEditor from "../components/NoteEditor";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import TabBar from "../components/TabBar";

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
  const [notes, setNotes] = useState<any[]>([]);
  const [openNotes, setOpenNotes] = useState<string[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const [splitScreen, setSplitScreen] = useState(false);
  const [secondaryNote, setSecondaryNote] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const loadedNotes = await window.electron.loadNotes();
      setNotes(loadedNotes);
      if (loadedNotes.length > 0) {
        setOpenNotes([loadedNotes[0].id]);
        setActiveNote(loadedNotes[0].id);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
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
      // Save the new note immediately
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
      // Optionally, you can show a toast notification that the path has been copied
      console.log('File path copied to clipboard:', filePath);
    } catch (error) {
      console.error('Error copying file path:', error);
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

  const handleLeftSidebarResize = (width: number) => {
    setLeftSidebarWidth(width);
  };

  const handleRightSidebarResize = (width: number) => {
    setRightSidebarWidth(width);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground pt-2">
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        onCopyFilePath={handleCopyFilePath}
        notes={notes}
        selectedNote={activeNote}
        onSelectNote={(id) => {
          setActiveNote(id);
          if (!openNotes.includes(id)) {
            setOpenNotes((prevOpen) => [...prevOpen, id]);
          }
        }}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onResize={handleLeftSidebarResize}
        onClose={toggleLeftSidebar}
      />
      <main
        className={`flex-grow transition-all duration-300 flex flex-col`}
        style={{
          marginLeft: isLeftSidebarOpen ? `${leftSidebarWidth}px` : '0',
          marginRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : '0',
        }}
      >
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
        <div className="flex-grow flex">
          <div
            className="flex-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "main")}
          >
            {activeNote && (
              <NoteEditor
                note={notes.find((note) => note.id === activeNote) || { id: "", title: "", content: "" }}
                onSave={handleSaveNote}
              />
            )}
          </div>
          {splitScreen && (
            <div
              className="flex-1 border-l border-border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "secondary")}
            >
              {secondaryNote && (
                <NoteEditor
                  note={notes.find((note) => note.id === secondaryNote) || { id: "", title: "", content: "" }}
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
      />
    </div>
  );
};

export default Notes;