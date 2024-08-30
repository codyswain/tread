import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Notebook, Image, User, PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    { to: "/settings", icon: User, text: "Settings" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-md border-b border-border z-50 h-12">
      <div className="flex items-center justify-between h-full px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleLeftSidebar}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
        <ul className="flex space-x-2 mx-auto">
          {navItems.map(({ to, icon: Icon, text }) => (
            <li key={to}>
              <NavItem
                to={to}
                icon={<Icon className="h-4 w-4" />}
                text={text}
                isActive={location.pathname === to}
              />
            </li>
          ))}
        </ul>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleRightSidebar}
          >
            {isRightSidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, isActive }) => (
  <Button
    asChild
    variant={isActive ? "secondary" : "ghost"}
    size="sm"
    className="h-8 px-3 text-sm font-medium"
  >
    <Link to={to} className="flex items-center space-x-2">
      {icon}
      <span>{text}</span>
    </Link>
  </Button>
);

export default Navbar;