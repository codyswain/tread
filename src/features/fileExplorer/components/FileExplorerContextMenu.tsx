import React from 'react';
import ContextMenu from '@/shared/components/ContextMenu/ContextMenu';
import ContextMenuItem from '@/shared/components/ContextMenu/ContextMenuItem';
import { FilePlus, FolderPlus, Trash2, Copy, Folder, Pencil } from 'lucide-react';

interface FileExplorerContextMenuProps {
  x: number;
  y: number;
  itemType: 'note' | 'folder' | 'topLevelFolder' | 'empty';
  onClose: () => void;
  onDelete: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onCopyFilePath?: (noteId: string) => void;
  onOpenNoteInNewTab?: (noteId: string) => void;
  itemId: string;
}

const FileExplorerContextMenu: React.FC<FileExplorerContextMenuProps> = ({
  x,
  y,
  itemType,
  onClose,
  onDelete,
  onCreateFile,
  onCreateFolder,
  onCopyFilePath,
  onOpenNoteInNewTab,
  itemId,
}) => {
  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      {(itemType === 'folder' || itemType === 'topLevelFolder' || itemType === 'empty') && (
        <>
          <ContextMenuItem icon={FilePlus} label="New File" onClick={() => { onCreateFile(); onClose(); }} />
          <ContextMenuItem icon={FolderPlus} label="New Folder" onClick={() => { onCreateFolder(); onClose(); }} />
        </>
      )}
      {itemType !== 'empty' && (
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
          {onCopyFilePath && (
            <ContextMenuItem 
              icon={Folder} 
              label="Copy File Path" 
              onClick={() => { onCopyFilePath(itemId); onClose(); }} 
            />
          )}
          {onOpenNoteInNewTab && (
            <ContextMenuItem 
              icon={Pencil} 
              label="Open in New Tab" 
              onClick={() => { onOpenNoteInNewTab(itemId); onClose(); }} 
            />
          )}
        </>
      )}
    </ContextMenu>
  );
};

export default FileExplorerContextMenu;