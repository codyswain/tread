import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import MediaGallery from "./pages/MediaGallery";
import Settings from "./pages/Settings";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { Toaster } from "@/components/ui/Toast";

import GlobalStyles from "./styles/GlobalStyles";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";

const App: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);
  const toggleRightSidebar = () => setIsRightSidebarOpen(!isRightSidebarOpen);

  return (
    <ThemeProvider>
      <TooltipProvider>
        <GlobalStyles />
        <Toaster />
        <Router>
          <div className="flex flex-col h-screen">
            <Navbar
              isLeftSidebarOpen={isLeftSidebarOpen}
              isRightSidebarOpen={isRightSidebarOpen}
              toggleLeftSidebar={toggleLeftSidebar}
              toggleRightSidebar={toggleRightSidebar}
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
                <Route path="/media" element={<MediaGallery />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;