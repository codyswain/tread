import { useCallback, useState } from "react";

export const useFolderCreation = (onCreateDirectory: (dirName: string) => void) => {
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFolder = useCallback(() => {
    setIsCreatingFolder(true);
    setError(null);
  }, []);

  const confirmCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    // Add validation for invalid characters in folder name
    const invalidChars = /[<>:"/\\|?*\p{C}]/u;
    if (invalidChars.test(newFolderName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    try {
      onCreateDirectory(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
      setError(null);
    } catch (err) {
      setError(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [newFolderName, onCreateDirectory]);

  const cancelCreateFolder = useCallback(() => {
    setIsCreatingFolder(false);
    setNewFolderName("");
    setError(null);
  }, []);

  return {
    newFolderName,
    setNewFolderName,
    isCreatingFolder,
    setIsCreatingFolder,
    handleCreateFolder,
    confirmCreateFolder,
    cancelCreateFolder,
    error,
  };
};