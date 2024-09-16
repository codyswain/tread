import React, { useState } from "react";
import RelatedNotes from "./RelatedNotes";
import NoteEditor from "./NoteEditor";
import NoteExplorer from "./NoteExplorer";
import BottomPane from "./BottomPane";
import { useNotesContext } from "../context/notesContext";

const Notes: React.FC<{
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isBottomPaneOpen: boolean;
  setIsLeftSidebarOpen: (isOpen: boolean) => void;
  setIsRightSidebarOpen: (isOpen: boolean) => void;
  setIsBottomPaneOpen: (isOpen: boolean) => void;
}> = ({
  isLeftSidebarOpen,
  isRightSidebarOpen,
  isBottomPaneOpen,
  setIsLeftSidebarOpen,
  setIsRightSidebarOpen,
  setIsBottomPaneOpen,
}) => {
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const [bottomPaneHeight, setBottomPaneHeight] = useState(256);
  const { activeNote } = useNotesContext();

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
          marginBottom: isBottomPaneOpen ? `${bottomPaneHeight}px` : "0",
          transition: "margin 0.3s ease-in-out",
        }}
      >
        {activeNote ? (
          <NoteEditor note={activeNote} />
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
      <BottomPane
        isOpen={isBottomPaneOpen}
        onResize={setBottomPaneHeight}
        onClose={() => setIsBottomPaneOpen(false)}
      />
    </div>
  );
};

export default Notes;
