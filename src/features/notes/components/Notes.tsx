import React, { useState, useRef, useEffect } from "react";
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
  const [bottomPaneHeight, setBottomPaneHeight] = useState(300);
  const { activeNote } = useNotesContext();

  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const bottomPaneRef = useRef<HTMLDivElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  useResizablePane({
    minWidth: 100,
    maxWidth: 400,
    width: leftSidebarWidth,
    setWidth: setLeftSidebarWidth,
    paneRef: leftSidebarRef,
    direction: "horizontal",
  });

  useResizablePane({
    minWidth: 100,
    maxWidth: 400,
    width: rightSidebarWidth,
    setWidth: setRightSidebarWidth,
    paneRef: rightSidebarRef,
    direction: "horizontal",
  });

  useEffect(() => {
    const updateBottomPaneHeight = () => {
      if (notesContainerRef.current && isBottomPaneOpen) {
        const maxHeight = notesContainerRef.current.clientHeight * 0.8;
        setBottomPaneHeight((prev) => Math.min(prev, maxHeight));
      }
    };

    updateBottomPaneHeight();
    window.addEventListener('resize', updateBottomPaneHeight);

    return () => {
      window.removeEventListener('resize', updateBottomPaneHeight);
    };
  }, [isBottomPaneOpen]);

  return (
    <div className="flex h-screen pt-12 bg-background text-foreground overflow-hidden">
      {isLeftSidebarOpen && (
        <div ref={leftSidebarRef} style={{ width: leftSidebarWidth, flexShrink: 0 }}>
          <NoteExplorer
            isOpen={isLeftSidebarOpen}
            onResize={setLeftSidebarWidth}
            onClose={() => setIsLeftSidebarOpen(false)}
          />
        </div>
      )}
      <div ref={notesContainerRef} className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-auto">
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
      {isRightSidebarOpen && (
        <div ref={rightSidebarRef} style={{ width: rightSidebarWidth, flexShrink: 0 }}>
          <RelatedNotes
            isOpen={isRightSidebarOpen}
            onResize={setRightSidebarWidth}
            onClose={() => setIsRightSidebarOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Notes;