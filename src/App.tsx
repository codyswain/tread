import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./containers/Home";
import Notes from "./containers/notes/Notes";
import MediaGallery from "./containers/MediaGallery";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { Toaster } from "@/components/ui/Toast";

import GlobalStyles from "./styles/GlobalStyles";
import "./index.css";
import NotesV2 from "@/features/notes/components/NotesV2";
import navbarItems from "@/features/navbar/config/navbarItems";
import Navbar from "@/features/navbar/components/Navbar";

import { ThemeProvider } from "@/features/theme";
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
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/notes"
                    element={
                      <Notes
                        isLeftSidebarOpen={isLeftSidebarOpen}
                        isRightSidebarOpen={isRightSidebarOpen}
                        toggleLeftSidebar={toggleLeftSidebar}
                        toggleRightSidebar={toggleRightSidebar}
                      />
                    }
                  />
                  <Route path="/new-notes" element={<NotesV2 />} />
                  <Route path="/media" element={<MediaGallery />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </Router>
        </TooltipProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
