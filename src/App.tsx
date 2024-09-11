import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GlobalStyles from "@/styles/GlobalStyles";

import "@/index.css";
import { ThemeProvider } from "@/features/theme";
import { Settings, SettingsProvider } from "@/features/settings";
import { Notes } from "@/features/notes";
import { Toaster } from "@/shared/components/Toast";
import { TooltipProvider } from "@/shared/components/Tooltip";
import { Navbar, navbarItems } from "@/features/navbar";
import { Feed } from "@/features/feed";
import { NotesProvider } from "./features/notes/context/notesContext";

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
            <GlobalStyles />
            <Toaster />
            <Router>
              <div className="flex flex-col h-screen">
                <Navbar
                  toggleLeftSidebar={toggleLeftSidebar}
                  toggleRightSidebar={toggleRightSidebar}
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
