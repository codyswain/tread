import React, { useCallback, useState } from "react";
import { useNotes } from "../hooks/useNotes";
import RelatedNotes from "./RelatedNotes";
import NoteEditor from "./NoteEditor";
import NoteExplorer from "./NoteExplorer";

const Notes: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const {
    notes,
    directoryStructure,
    activeNote,
    similarNotes,
    createNote,
    saveNote,
    deleteNote,
    selectNote,
    findSimilarNotes,
  } = useNotes();

  const handleLeftSidebarResize = (width: number) => {
    setLeftSidebarWidth(width);
  };

  const handleRightSidebarResize = (width: number) => {
    setRightSidebarWidth(width);
  };

  const handleSelectNote = useCallback(
    (noteId: string) => {
      selectNote(noteId);
      findSimilarNotes(noteId);
    },
    [selectNote, findSimilarNotes]
  );

  const handleCreateNote = useCallback(
    (dirPath: string) => {
      createNote(dirPath);
    },
    [createNote]
  );

  const handleDeleteNote = useCallback(
    (noteId: string, dirPath: string) => {
      deleteNote(noteId, dirPath);
    },
    [deleteNote]
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <NoteExplorer
        isOpen={isLeftSidebarOpen}
        directoryStructure={directoryStructure}
        selectedNote={activeNote}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onResize={handleLeftSidebarResize}
        onClose={() => setIsLeftSidebarOpen(false)}
        onCopyFilePath={(noteId) => console.log("Copy file path:", noteId)} // TODO: Implement this function
        onOpenNoteInNewTab={(noteId) =>
          console.log("Open note in new tab:", noteId)
        } // TODO: Implement this function
        onCreateDirectory={(dirPath) =>
          console.log("Create directory:", dirPath)
        } // TODO: Implement this function
        onDeleteDirectory={(dirPath) =>
          console.log("Delete directory:", dirPath)
        } // TODO: Implement this function
      />
      <main
        className="flex-grow flex flex-col overflow-hidden"
        style={{
          marginLeft: isLeftSidebarOpen ? `${leftSidebarWidth}px` : "0",
          marginRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : "0",
          transition: "margin 0.3s ease-in-out",
        }}
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
            onSave={saveNote}
          />
        )}
      </main>
      <RelatedNotes
        isOpen={isRightSidebarOpen}
        onResize={handleRightSidebarResize}
        onClose={() => setIsRightSidebarOpen(false)}
        currentNoteId={activeNote || ""}
        currentNoteContent={
          notes.find((note) => note.id === activeNote)?.content || ""
        }
        onOpenNote={handleSelectNote}
        isSimilarNotesLoading={false} // Implement loading state
        similarNotes={similarNotes}
      />
    </div>
  );
};

export default Notes;
