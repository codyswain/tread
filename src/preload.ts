import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  loadNotes: () => ipcRenderer.invoke('load-notes'),
  saveNote: (note: any) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId: string) => ipcRenderer.invoke('delete-note', noteId),
});