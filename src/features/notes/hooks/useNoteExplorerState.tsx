import { useState, useCallback } from "react";

export const useNoteExplorerState = (onCreateDirectory: (dirPath: string) => void) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleDirectory = useCallback((dirPath: string) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dirPath)) {
        newSet.delete(dirPath);
      } else {
        newSet.add(dirPath);
      }
      return newSet;
    });
  }, []);

  const handleCreateFolder = useCallback(() => {
    setIsCreatingFolder(true);
    setNewFolderName("");
    setError(null);
  }, []);

  const confirmCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    const invalidChars = /[<>:"/\\|?*\p{C}]/u;
    if (invalidChars.test(newFolderName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    try {
      onCreateDirectory(`${currentPath}/${newFolderName.trim()}`);
      setIsCreatingFolder(false);
      setNewFolderName("");
      setError(null);
    } catch (err) {
      setError(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [currentPath, newFolderName, onCreateDirectory]);

  const cancelCreateFolder = useCallback(() => {
    setIsCreatingFolder(false);
    setNewFolderName("");
    setError(null);
  }, []);

  return {
    expandedDirs,
    toggleDirectory,
    currentPath,
    setCurrentPath,
    handleCreateFolder,
    newFolderState: {
      isCreatingFolder,
      newFolderName,
      setNewFolderName,
      confirmCreateFolder,
      cancelCreateFolder,
      error,
    },
  };
};