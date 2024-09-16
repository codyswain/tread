import React from "react";
import { cn } from "@/shared/utils";
import { useResizablePane } from "@/shared/hooks/useResizablePane";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { Button } from "@/shared/components/Button";
import { Settings } from "lucide-react";
import { toast } from "@/shared/components/Toast";

interface BottomPaneProps {
  isOpen: boolean;
  onResize: (height: number) => void;
  onClose: () => void;
}

const BottomPane: React.FC<BottomPaneProps> = ({
  isOpen,
  onResize,
  onClose,
}) => {
  const { height, paneRef, startResizing } = useResizablePane({
    minHeight: 100,
    maxHeight: 400,
    defaultHeight: 256,
    isOpen,
    onResize,
    onClose,
  });

  return (
    <div
      ref={paneRef}
      className={cn(
        "bg-background border-t border-border transition-all duration-300 overflow-hidden relative",
        isOpen ? `h-[${height}px]` : "h-0"
      )}
      style={{ height: isOpen ? height : 0 }}
    >
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm">Bottom Pane</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => toast("Settings feature is not implemented yet")}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <div className="p-4">
          <p>This is the content of the bottom pane.</p>
        </div>
      </ScrollArea>
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-accent/50"
        style={{ top: "-1px" }}
      />
    </div>
  );
};

export default BottomPane;
