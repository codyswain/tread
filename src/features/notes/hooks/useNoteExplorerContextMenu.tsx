import { useState, useCallback, useEffect } from "react";

interface ContextMenuState {
  x: number;
  y: number;
  itemId: string;
  itemType: "note" | "folder" | "topLevelFolder";
  dirPath: string;
}

export const useNoteExplorerContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = useCallback(
    (
      e: React.MouseEvent,
      itemId: string,
      itemType: "note" | "folder" | "topLevelFolder",
      dirPath: string
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        itemId,
        itemType,
        dirPath,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      closeContextMenu();
    };

    if (contextMenu) {
      document.addEventListener("click", handleGlobalClick);
    }

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [contextMenu, closeContextMenu]);

  return { contextMenu, handleContextMenu, closeContextMenu };
};