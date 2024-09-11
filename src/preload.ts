import { contextBridge, ipcRenderer } from "electron";
import { DirectoryStructure, DirectoryStructures, Note } from "./shared/types";

contextBridge.exposeInMainWorld("electron", {
  loadNotes: () => ipcRenderer.invoke("load-notes"),
  saveNote: (note: Note, dirPath: string) =>
    ipcRenderer.invoke("save-note", note, dirPath),
  deleteNote: (noteId: string) => ipcRenderer.invoke("delete-note", noteId),
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),
  runPythonScript: (scriptName: string, args: string[]) =>
    ipcRenderer.invoke("run-python-script", scriptName, args),
  getNotePath: (noteId: string) => ipcRenderer.invoke("get-note-path", noteId),
  saveEmbedding: (note: Note, dirPath: string) =>
    ipcRenderer.invoke("save-embedding", note, dirPath),
  getOpenAIKey: () => ipcRenderer.invoke("get-openai-key"),
  setOpenAIKey: (key: string) => ipcRenderer.invoke("set-openai-key", key),
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke("create-directory", dirPath),
  deleteDirectory: (dirName: string) =>
    ipcRenderer.invoke("delete-directory", dirName),
  getTopLevelFolders: () => ipcRenderer.invoke("get-top-level-folders"),
  addTopLevelFolder: (folderPath: string) =>
    ipcRenderer.invoke("add-top-level-folder", folderPath),
  removeTopLevelFolder: (folderPath: string) =>
    ipcRenderer.invoke("remove-top-level-folder", folderPath),
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),

  getDirectoryStructure: (dirPath: string) =>
    ipcRenderer.invoke("get-directory-structure", dirPath),
  loadNote: (dirPath: string) => ipcRenderer.invoke("load-note", dirPath),
  deleteFileNode: (fileNodeType: string, fileNodePath: string) =>
    ipcRenderer.invoke("delete-file-node", fileNodeType, fileNodePath),

  generateNoteEmbeddings: (note: Note, fileNode: DirectoryStructure) => ipcRenderer.invoke('generate-note-embeddings', note, fileNode),
  findSimilarNotes: (query: string, directoryStructures: DirectoryStructures) => ipcRenderer.invoke("perform-similarity-search", query, directoryStructures),
});
