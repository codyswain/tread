import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Copy, FolderOpen } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
  noteId: string;
  onCopyFilePath: (noteId: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onDelete, onClose, noteId, onCopyFilePath }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        backgroundColor: 'hsl(var(--background) / 1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '150px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        className="w-full justify-start px-2 py-1.5 text-sm"
        onClick={() => {
          console.log('Copy note ID', noteId);
          navigator.clipboard.writeText(noteId);
          onClose();
        }}
      >
        <Copy className="mr-2 h-4 w-4" /> Copy ID
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start px-2 py-1.5 text-sm"
        onClick={() => {
          onCopyFilePath(noteId);
          onClose();
        }}
      >
        <FolderOpen className="mr-2 h-4 w-4" /> Copy File Path
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start px-2 py-1.5 text-sm text-destructive hover:text-destructive"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
    </div>
  );
};

export default ContextMenu;