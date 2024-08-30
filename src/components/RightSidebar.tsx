import React from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";

interface RightSidebarProps {
  isOpen: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen }) => {
  return (
    <div
      className={`fixed top-12 right-0 h-[calc(100vh-3rem)] bg-background border-l border-border transition-all duration-300 ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="text-sm font-semibold mb-3">Related Notes</h2>
          {/* Add your related notes content here */}
        </div>
      </ScrollArea>
    </div>
  );
};


export default RightSidebar;
