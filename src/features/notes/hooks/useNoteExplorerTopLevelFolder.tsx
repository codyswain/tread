import { useState, useCallback, useEffect } from "react";

export const useTopLevelFolders = () => {
  const [topLevelFolders, setTopLevelFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTopLevelFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    setLoadError(null);
    try {
      const folders = await window.electron.getTopLevelFolders();
      setTopLevelFolders(folders);
    } catch (error) {
      setLoadError("Failed to load top-level folders");
      console.error(error);
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  useEffect(() => {
    loadTopLevelFolders();
  }, [loadTopLevelFolders]);

  const handleAddTopLevelFolder = useCallback(async () => {
    const result = await window.electron.openFolderDialog();
    if (result) {
      await window.electron.addTopLevelFolder(result);
      loadTopLevelFolders();
    }
  }, [loadTopLevelFolders]);

  return {
    topLevelFolders,
    isLoadingFolders,
    loadError,
    handleAddTopLevelFolder,
    loadTopLevelFolders,
  };
};