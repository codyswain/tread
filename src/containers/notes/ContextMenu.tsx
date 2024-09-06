import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, Copy, FolderPlus, FilePlus, Folder } from "lucide-react";

const ContextMenu: React.FC<{
  x: number;
  y: number;
  onDelete: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  itemId: string;
  itemType: 'note' | 'folder' | 'empty';
  dirPath: string;
  onClose: () => void;
  onCopyFilePath?: (noteId: string) => void;
  onOpenNoteInNewTab?: (noteId: string) => void;
}> = ({
  x,
  y,
  onDelete,
  onCreateFile,
  onCreateFolder,
  itemId,
  itemType,
  dirPath,
  onClose,
  onCopyFilePath,
  onOpenNoteInNewTab,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 9999,
        backgroundColor: "hsl(var(--background) / 1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "150px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {(itemType === 'folder' || itemType === 'empty') && (
        <>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-1.5 text-sm"
            onClick={() => {
              onCreateFile();
              onClose();
            }}
          >
            <FilePlus className="mr-2 h-4 w-4" /> New File
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-1.5 text-sm"
            onClick={() => {
              onCreateFolder();
              onClose();
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
        </>
      )}
      {itemType !== 'empty' && (
        <Button
          variant="ghost"
          className="w-full justify-start px-2 py-1.5 text-sm text-destructive"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      )}
      {itemType === 'note' && (
        <>
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-1.5 text-sm"
            onClick={() => {
              navigator.clipboard.writeText(itemId);
              onClose();
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy ID
          </Button>
          {onCopyFilePath && (
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 text-sm"
              onClick={() => {
                onCopyFilePath(itemId);
                onClose();
              }}
            >
              <Folder className="mr-2 h-4 w-4" /> Copy File Path
            </Button>
          )}
          {onOpenNoteInNewTab && (
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 text-sm"
              onClick={() => {
                onOpenNoteInNewTab(itemId);
                onClose();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Open in New Tab
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ContextMenu;