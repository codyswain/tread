import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

interface RightSidebarProps {
  isOpen: boolean;
  onResize: (width: number) => void;
  onClose: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onResize, onClose }) => {
  const [width, setWidth] = useState(256);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 100 && newWidth <= 400) {
        setWidth(newWidth);
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (resizeRef.current) {
        resizeRef.current.classList.remove("bg-accent");
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize]);

  const startResizing = () => {
    isResizing.current = true;
    if (resizeRef.current) {
      resizeRef.current.classList.add("bg-accent");
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed top-12 right-0 h-[calc(100vh-3rem)] bg-background border-l border-border transition-all duration-300 z-10 overflow-hidden",
        isOpen ? `w-[${width}px]` : "w-0"
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm">Related Notes</span>
      </div>
      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-4">
          {/* Add your related notes content here */}
        </div>
      </ScrollArea>
      <div className="absolute bottom-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => console.log("Open settings modal")}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={resizeRef}
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:bg-accent/50"
      />
    </div>
  );
};

export default RightSidebar;