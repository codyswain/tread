import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home, Notebook, Image, X, Minus, Square, PanelLeft, PanelRight, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isLeftSidebarOpen,
  isRightSidebarOpen,
  toggleLeftSidebar,
  toggleRightSidebar
}) => {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, text: "Home" },
    { to: "/notes", icon: Notebook, text: "Notes" },
    { to: "/media", icon: Image, text: "Files" },
  ];

  const handleMinimize = () => {
    window.electron.minimize();
  };

  const handleMaximize = () => {
    window.electron.maximize();
  };

  const handleClose = () => {
    window.electron.close();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 bg-background border-b border-border flex items-center justify-between px-4 z-20">
      <div className="flex items-center space-x-2 no-drag">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMinimize}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMaximize}>
          <Square className="h-4 w-4" />
        </Button>
      </div>
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
    </nav>
  );
};

export default Navbar;