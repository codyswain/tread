// App.tsx

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

const App: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);
  const toggleRightSidebar = () => setIsRightSidebarOpen(!isRightSidebarOpen);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <TooltipProvider>
          <NotesProvider>
            <Toaster />
            <Router>
              <div className="flex flex-col h-screen">
                <Navbar
                  toggleLeftSidebar={toggleLeftSidebar}
                  toggleRightSidebar={toggleRightSidebar}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  isRightSidebarOpen={isRightSidebarOpen}
                  items={navbarItems}
                />
                <main className="flex-grow pt-10">
                  <Routes>
                    <Route path="/" element={<Feed />} />
                    <Route
                      path="/notes"
                      element={
                      <Notes 
                        isLeftSidebarOpen={isLeftSidebarOpen}
                        isRightSidebarOpen={isRightSidebarOpen}
                        setIsLeftSidebarOpen={setIsLeftSidebarOpen}
                        setIsRightSidebarOpen={setIsRightSidebarOpen}
                      />}
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
