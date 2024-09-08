import React from 'react';
import ContextMenu from '@/shared/components/ContextMenu/ContextMenu';
import ContextMenuItem from '@/shared/components/ContextMenu/ContextMenuItem';
import { FilePlus, FolderPlus, Trash2, Copy, Folder, Pencil } from 'lucide-react';

interface NoteExplorerContextMenuProps {
  contextMenu: {
    x: number;
    y: number;
    itemId: string;
    itemType: 'note' | 'folder' | 'topLevelFolder';
    dirPath: string;
  } | null;
  onClose: () => void;
  onDelete: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onCopyFilePath: (noteId: string) => void;
  onOpenNoteInNewTab: (noteId: string) => void;
}

const NoteExplorerContextMenu: React.FC<NoteExplorerContextMenuProps> = ({
  contextMenu,
  onClose,
  onDelete,
  onCreateFile,
  onCreateFolder,
  onCopyFilePath,
  onOpenNoteInNewTab,
}) => {
  if (!contextMenu) return null;

  const { x, y, itemType, itemId } = contextMenu;

  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      {(itemType === 'folder' || itemType === 'topLevelFolder') && (
        <>
          <ContextMenuItem icon={FilePlus} label="New File" onClick={() => { onCreateFile(); onClose(); }} />
          <ContextMenuItem icon={FolderPlus} label="New Folder" onClick={() => { onCreateFolder(); onClose(); }} />
        </>
      )}
      {itemType !== 'topLevelFolder' && (
        <ContextMenuItem 
          icon={Trash2} 
          label="Delete" 
          onClick={() => { onDelete(); onClose(); }} 
          className="text-destructive"
        />
      )}
      {itemType === 'note' && (
        <>
          <ContextMenuItem 
            icon={Copy} 
            label="Copy ID" 
            onClick={() => { navigator.clipboard.writeText(itemId); onClose(); }} 
          />
          <ContextMenuItem 
            icon={Folder} 
            label="Copy File Path" 
            onClick={() => { onCopyFilePath(itemId); onClose(); }} 
          />
          <ContextMenuItem 
            icon={Pencil} 
            label="Open in New Tab" 
            onClick={() => { onOpenNoteInNewTab(itemId); onClose(); }} 
          />
        </>
      )}
    </ContextMenu>
  );
};

export default NoteExplorerContextMenu;