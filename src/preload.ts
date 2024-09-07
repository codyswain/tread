import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  loadNotes: () => ipcRenderer.invoke("load-notes"),
  saveNote: (note: any) => ipcRenderer.invoke("save-note", note),
  deleteNote: (noteId: string) => ipcRenderer.invoke("delete-note", noteId),
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),
  runPythonScript: (scriptName: string, args: string[]) =>
    ipcRenderer.invoke("run-python-script", scriptName, args),
  getNotePath: (noteId: string) => ipcRenderer.invoke("get-note-path", noteId),
  findSimilarNotes: (query: string) =>
    ipcRenderer.invoke("find-similar-notes", query),
  saveEmbedding: (noteId: string, content: string) =>
    ipcRenderer.invoke("save-embedding", noteId, content),
  getOpenAIKey: () => ipcRenderer.invoke("get-openai-key"),
  setOpenAIKey: (key: string) => ipcRenderer.invoke("set-openai-key", key),
  createDirectory: (dirName: string) => ipcRenderer.invoke("create-directory", dirName),
  deleteDirectory: (dirName: string) => ipcRenderer.invoke("delete-directory", dirName),
  getTopLevelFolders: () => ipcRenderer.invoke("get-top-level-folders"),
  addTopLevelFolder: (folderPath: string) => ipcRenderer.invoke("add-top-level-folder", folderPath),
  removeTopLevelFolder: (folderPath: string) => ipcRenderer.invoke("remove-top-level-folder", folderPath),
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
});
