import { NavbarItemProps } from "../components/NavbarItem";
import { Home, Notebook, Image } from "lucide-react";

const navbarItems: NavbarItemProps[] = [
  { to: "/", icon: Home, text: "Home" },
  { to: "/notes", icon: Notebook, text: "Notes" },
  { to: "/new-notes", icon: Notebook, text: "New Notes" },
  { to: "/media", icon: Image, text: "Files" },
];

export default navbarItems;