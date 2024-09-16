import React, { useState, useRef } from "react";
import RelatedNotes from "./RelatedNotes";
import NoteEditor from "./NoteEditor";
import NoteExplorer from "./NoteExplorer";
import BottomPane from "./BottomPane";
import { useNotesContext } from "../context/notesContext";
import { useResizablePane } from "@/shared/hooks/useResizablePane";

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

  const bottomPaneRef = useRef<HTMLDivElement>(null);

  useResizablePane({
    minHeight: 100,
    maxHeight: 400,
    height: bottomPaneHeight,
    setHeight: setBottomPaneHeight,
    paneRef: bottomPaneRef,
    direction: 'vertical',
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <NoteExplorer
        isOpen={isLeftSidebarOpen}
        onResize={setLeftSidebarWidth}
        onClose={() => setIsLeftSidebarOpen(false)}
      />
      <div
        className="flex-grow flex flex-col"
        style={{
          marginLeft: isLeftSidebarOpen ? `${leftSidebarWidth}px` : "0",
          marginRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : "0",
          transition: "margin 0.3s ease-in-out",
        }}
      >
        <div className="flex-grow flex flex-col overflow-hidden">
          {activeNote ? (
            <NoteEditor note={activeNote} />
          ) : (
            <div className="flex w-full h-full justify-center items-center">
              Please select a note
            </div>
          )}
        </div>
        {isBottomPaneOpen && (
          <BottomPane
            height={bottomPaneHeight}
            setHeight={setBottomPaneHeight}
            paneRef={bottomPaneRef}
            onClose={() => setIsBottomPaneOpen(false)}
          />
        )}
      </div>
      <RelatedNotes
        isOpen={isRightSidebarOpen}
        onResize={setRightSidebarWidth}
        onClose={() => setIsRightSidebarOpen(false)}
      />
    </div>
  );
};

export default Notes;
