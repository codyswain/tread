import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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
  const [leftSidebarSize, setLeftSidebarSize] = useState(20);
  const [rightSidebarSize, setRightSidebarSize] = useState(20);
  const [bottomPaneSize, setBottomPaneSize] = useState(30);

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
      {isLeftSidebarOpen && (
        <>
          <Panel
            defaultSize={leftSidebarSize}
            minSize={10}
            maxSize={40}
            onResize={handleResize('leftSidebar')}
          >
            <NoteExplorer
              isOpen={isLeftSidebarOpen}
              onClose={() => setIsLeftSidebarOpen(false)}
            />
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-accent/50 cursor-ew-resize" />
        </>
      )}
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
          {isBottomPaneOpen && (
            <>
              <PanelResizeHandle className="h-1 bg-border hover:bg-accent/50 cursor-ns-resize" />
              <Panel
                defaultSize={bottomPaneSize}
                minSize={10}
                maxSize={80}
                onResize={handleResize('bottomPane')}
              >
                <BottomPane onClose={() => setIsBottomPaneOpen(false)} />
              </Panel>
            </>
          )}
        </PanelGroup>
      </Panel>
      {isRightSidebarOpen && (
        <>
          <PanelResizeHandle className="w-1 bg-border hover:bg-accent/50 cursor-ew-resize" />
          <Panel
            defaultSize={rightSidebarSize}
            minSize={10}
            maxSize={40}
            onResize={handleResize('rightSidebar')}
          >
            <RelatedNotes
              isOpen={isRightSidebarOpen}
              onClose={() => setIsRightSidebarOpen(false)}
            />
          </Panel>
        </>
      )}
    </PanelGroup>
  );
};

export default Notes;