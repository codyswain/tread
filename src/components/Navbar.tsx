import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Notebook, Image, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, text: "Home" },
    { to: "/notes", icon: Notebook, text: "Notes" },
    { to: "/media", icon: Image, text: "Media" },
    { to: "/profile", icon: User, text: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-b border-border z-50">
      <div className="container flex items-center justify-between h-16">
        <ul className="flex space-x-1">
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
        <ThemeToggle />
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
    className="gap-2"
  >
    <Link to={to}>
      {icon}
      <span className="sr-only sm:not-sr-only">{text}</span>
    </Link>
  </Button>
);

export default Navbar;