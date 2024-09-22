import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "@/index.css";

import { ThemeProvider } from "@/features/theme";
import { NotesProvider } from "@/features/notes/context/notesContext";
import { TooltipProvider } from "@/shared/components/Tooltip";
import { Toaster } from "@/shared/components/Toast";
import { Navbar, navbarItems } from "@/features/navbar";
import { Notes } from "@/features/notes";
import { Settings, SettingsProvider } from "@/features/settings";
import useLocalStorage from "@/shared/hooks/useLocalStorage";
import { commandRegistry, useCommands } from "./features/commands";
import { Command } from "./features/commands/services/commandRegistry";
import { KBar, KBarActionsProvider } from "./features/kbar";

const App: React.FC = () => {
  const { registerCommand, unregisterCommand } = useCommands();

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useLocalStorage(
    "isLeftSidebarOpen",
    true
  );
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useLocalStorage(
    "isRightSidebarOpen",
    true
  );
  const [isBottomPaneOpen, setIsBottomPaneOpen] = useLocalStorage(
    "isBottomPaneOpen",
    true
  );

  const toggleLeftSidebar = useCallback(
    () => setIsLeftSidebarOpen(!isLeftSidebarOpen),
    [isLeftSidebarOpen]
  );
  const toggleRightSidebar = useCallback(
    () => setIsRightSidebarOpen(!isRightSidebarOpen),
    [isRightSidebarOpen]
  );
  const toggleBottomPane = useCallback(
    () => setIsBottomPaneOpen(!isBottomPaneOpen),
    [isBottomPaneOpen]
  );

  useEffect(() => {
    const commands: Command[] = [
      {
        id: "pane.toggleLeft",
        name: "Toggle Left Pane",
        type: "paneToggle",
        keywords: ["pane", "toggle"],
        perform: toggleLeftSidebar,
      },
      {
        id: "pane.toggleRight",
        name: "Toggle Right Pane",
        type: "paneToggle",
        keywords: ["pane", "toggle"],
        perform: toggleRightSidebar,
      },
      {
        id: "pane.toggleBottom",
        name: "Toggle Bottom Pane",
        type: "paneToggle",
        keywords: ["pane", "toggle"],
        perform: toggleBottomPane,
      },
    ];

    commands.forEach(registerCommand);

    return () => {
      commands.forEach((command) => unregisterCommand(command));
    };
  }, [
    registerCommand,
    unregisterCommand,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBottomPane,
  ]);

  return (
    <Router>
      <KBarActionsProvider>
        <KBar />
        <ThemeProvider>
          <SettingsProvider>
            <TooltipProvider>
              <NotesProvider>
                <div className="flex flex-col h-screen w-screen overflow-hidden">
                  <Toaster />
                  <div className="flex flex-col flex-grow overflow-hidden">
                    <Navbar
                      toggleLeftSidebar={toggleLeftSidebar}
                      toggleRightSidebar={toggleRightSidebar}
                      toggleBottomPane={toggleBottomPane}
                      isLeftSidebarOpen={isLeftSidebarOpen}
                      isRightSidebarOpen={isRightSidebarOpen}
                      isBottomPaneOpen={isBottomPaneOpen}
                      items={navbarItems}
                    />
                    <main className="flex-grow overflow-hidden mt-12">
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/notes" replace />}
                        />
                        <Route path="/settings" element={<Settings />} />
                        <Route
                          path="/notes"
                          element={
                            <Notes
                              isLeftSidebarOpen={isLeftSidebarOpen}
                              isRightSidebarOpen={isRightSidebarOpen}
                              isBottomPaneOpen={isBottomPaneOpen}
                              setIsLeftSidebarOpen={setIsLeftSidebarOpen}
                              setIsRightSidebarOpen={setIsRightSidebarOpen}
                              setIsBottomPaneOpen={setIsBottomPaneOpen}
                            />
                          }
                        />
                      </Routes>
                    </main>
                  </div>
                </div>
              </NotesProvider>
            </TooltipProvider>
          </SettingsProvider>
        </ThemeProvider>
      </KBarActionsProvider>
    </Router>
  );
};

export default App;
