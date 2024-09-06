import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Notebook,
  Image,
  X,
  Minus,
  Square,
  PanelLeft,
  PanelRight,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/", icon: Home, text: "Home" },
  { to: "/notes", icon: Notebook, text: "Notes" },
  { to: "/media", icon: Image, text: "Files" },
];

const Navbar: React.FC<{
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}> = ({ toggleLeftSidebar, toggleRightSidebar }) => {
  const location = useLocation();

  const handleWindowAction = (action: "minimize" | "maximize" | "close") => {
    window.electron[action]();
  };

  const renderWindowControls = () => (
    <div className="flex items-center space-x-2 no-drag">
      {[
        { action: "close", icon: X },
        { action: "minimize", icon: Minus },
        { action: "maximize", icon: Square },
      ].map(({ action, icon: Icon }) => (
        <Button
          key={action}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            handleWindowAction(action as "minimize" | "maximize" | "close")
          }
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );

  const renderNavItems = () => (
    <ul className="flex items-center space-x-2 no-drag mx-auto">
      {navItems.map(({ to, icon: Icon, text }) => (
        <li key={to}>
          <Link
            to={to}
            className={`flex items-center px-3 py-1 rounded-md text-sm ${
              location.pathname === to
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {text}
          </Link>
        </li>
      ))}
    </ul>
  );

  const renderSidebarControls = () => (
    <div className="flex items-center space-x-2 no-drag">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleLeftSidebar}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleRightSidebar}
      >
        <PanelRight className="h-4 w-4" />
      </Button>
      <Link to="/settings">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-background border-b border-border flex items-center justify-between px-4 z-20 drag-handle">
      {renderWindowControls()}
      {renderNavItems()}
      {renderSidebarControls()}
    </nav>
  );
};

export default Navbar;
