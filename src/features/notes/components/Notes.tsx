import React, { useState } from "react";
import RelatedNotes from "./RelatedNotes";
import NoteEditor from "./NoteEditor";
import NoteExplorer from "./NoteExplorer";
import { useNotesContext } from "../context/notesContext";

const Notes: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const { saveNote, activeNote } = useNotesContext();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <NoteExplorer
        isOpen={isLeftSidebarOpen}
        onResize={setLeftSidebarWidth}
        onClose={() => setIsLeftSidebarOpen(false)}
      />
      <main
        className="flex-grow flex flex-col overflow-hidden"
        style={{
          marginLeft: isLeftSidebarOpen ? `${leftSidebarWidth}px` : "0",
          marginRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : "0",
          transition: "margin 0.3s ease-in-out",
        }}
      >
        {activeNote ? (
          <NoteEditor note={activeNote} onSave={saveNote} />
        ) : (
          <div className="flex w-full h-full justify-center items-center">
            Please select a note
          </div>
        )}
      </main>
      <RelatedNotes
        isOpen={isRightSidebarOpen}
        onResize={setRightSidebarWidth}
        onClose={() => setIsRightSidebarOpen(false)}
      />
    </div>
  );
};

export default Notes;
