import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/Button";
// import { ThemeToggle } from "./ThemeToggle";
import { NavbarItem, NavbarItemProps } from "./NavbarItem";
import { Minus, PanelLeft, PanelRight, Settings, Square, X } from "lucide-react";

interface NavbarProps {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  items: NavbarItemProps[];
}

const Navbar: React.FC<NavbarProps> = ({ toggleLeftSidebar, toggleRightSidebar, items }) => {
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
          onClick={() => handleWindowAction(action as "minimize" | "maximize" | "close")}
        >
          <span className="sr-only">{action}</span>
          <Icon className="h-4 w-4 mr-2" />
        </Button>
      ))}
    </div>
  );

  const renderNavItems = () => (
    <ul className="flex items-center space-x-2 no-drag mx-auto">
      {items.map((item) => (
        <NavbarItem key={item.to} {...item} isActive={location.pathname === item.to} />
      ))}
    </ul>
  );

  const renderSidebarControls = () => (
    <div className="flex items-center space-x-2 no-drag">
      {/* <ThemeToggle /> */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleLeftSidebar}>
        <PanelLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleRightSidebar}>
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