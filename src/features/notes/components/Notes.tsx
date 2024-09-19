import React, { useState, useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
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
  const { activeNote } = useNotesContext();
  const [leftSidebarSize, setLeftSidebarSize] = useState(18);
  const [rightSidebarSize, setRightSidebarSize] = useState(18);
  const [bottomPaneSize, setBottomPaneSize] = useState(34);

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);

  const handlePanelCollapse = (panelName: string) => {
    switch (panelName) {
      case 'leftSidebar':
        setIsLeftSidebarOpen(false);
        break;
      case 'rightSidebar':
        setIsRightSidebarOpen(false);
        break;
      case 'bottomPane':
        setIsBottomPaneOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (leftPanelRef.current) {
      if (isLeftSidebarOpen) {
        leftPanelRef.current.expand();
      } else {
        leftPanelRef.current.collapse();
      }
    }
  }, [isLeftSidebarOpen]);

  useEffect(() => {
    if (rightPanelRef.current) {
      if (isRightSidebarOpen) {
        rightPanelRef.current.expand();
      } else {
        rightPanelRef.current.collapse();
      }
    }
  }, [isRightSidebarOpen]);

  useEffect(() => {
    if (bottomPanelRef.current) {
      if (isBottomPaneOpen) {
        bottomPanelRef.current.expand();
      } else {
        bottomPanelRef.current.collapse();
      }
    }
  }, [isBottomPaneOpen]);

  const handleResize = (panelName: string) => (size: number) => {
    switch (panelName) {
      case 'leftSidebar':
        setLeftSidebarSize(size);
        break;
      case 'rightSidebar':
        setRightSidebarSize(size);
        break;
      case 'bottomPane':
        setBottomPaneSize(size);
        break;
    }
  };

  return (
    <PanelGroup direction="horizontal" className="h-screen pt-12">
      <Panel
        ref={leftPanelRef}
        defaultSize={leftSidebarSize}
        minSize={10}
        maxSize={40}
        onResize={handleResize('leftSidebar')}
        collapsible={true}
        onCollapse={() => handlePanelCollapse('leftSidebar')}
      >
        <NoteExplorer
          isOpen={isLeftSidebarOpen}
          onClose={() => setIsLeftSidebarOpen(false)}
        />
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-accent/50 cursor-ew-resize" />
      <Panel>
        <PanelGroup direction="vertical">
          <Panel>
            {activeNote ? (
              <NoteEditor note={activeNote} />
            ) : (
              <div className="flex w-full h-full justify-center items-center">
                Please select a note
              </div>
            )}
          </Panel>
          <PanelResizeHandle className="h-1 bg-border hover:bg-accent/50 cursor-ns-resize" />
          <Panel
            ref={bottomPanelRef}
            defaultSize={bottomPaneSize}
            minSize={10}
            maxSize={80}
            onResize={handleResize('bottomPane')}
            collapsible={true}
            onCollapse={() => handlePanelCollapse('bottomPane')}
          >
            <BottomPane onClose={() => setIsBottomPaneOpen(false)} />
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-accent/50 cursor-ew-resize" />
      <Panel
        ref={rightPanelRef}
        defaultSize={rightSidebarSize}
        minSize={10}
        maxSize={40}
        onResize={handleResize('rightSidebar')}
        collapsible={true}
        onCollapse={() => handlePanelCollapse('rightSidebar')}
      >
        <RelatedNotes
          isOpen={isRightSidebarOpen}
          onClose={() => setIsRightSidebarOpen(false)}
        />
      </Panel>
    </PanelGroup>
  );
};

export default Notes;