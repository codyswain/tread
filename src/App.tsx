import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "@/index.css";

import { ThemeProvider } from "@/features/theme";
import { NotesProvider } from "@/features/notes/context/notesContext";
import { TooltipProvider } from "@/shared/components/Tooltip";
import { Toaster } from "@/shared/components/Toast";
import { Navbar, navbarItems } from "@/features/navbar";
import { Feed } from "@/features/feed";
import { Notes } from "@/features/notes";
import { Settings, SettingsProvider } from "@/features/settings";
import useLocalStorage from "@/shared/hooks/useLocalStorage";

const App: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useLocalStorage("isLeftSidebarOpen", true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useLocalStorage("isRightSidebarOpen", true);
  const [isBottomPaneOpen, setIsBottomPaneOpen] = useLocalStorage("isBottomPaneOpen", true);

  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);
  const toggleRightSidebar = () => setIsRightSidebarOpen(!isRightSidebarOpen);
  const toggleBottomPane = () => setIsBottomPaneOpen(!isBottomPaneOpen);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <TooltipProvider>
          <NotesProvider>
            <Toaster />
            <Router>
              <div className="flex flex-col h-screen overflow-hidden">
                <Navbar
                  toggleLeftSidebar={toggleLeftSidebar}
                  toggleRightSidebar={toggleRightSidebar}
                  toggleBottomPane={toggleBottomPane}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  isRightSidebarOpen={isRightSidebarOpen}
                  isBottomPaneOpen={isBottomPaneOpen}
                  items={navbarItems}
                />
                <main className="flex-grow overflow-hidden">
                  <Routes>
                    {/* <Route path="/" element={<Feed />} /> */}
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
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </NotesProvider>
        </TooltipProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;