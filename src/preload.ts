import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  loadNotes: () => ipcRenderer.invoke('load-notes'),
  saveNote: (note: any) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId: string) => ipcRenderer.invoke('delete-note', noteId),
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  runPythonScript: (scriptName: string, args: string[]) => ipcRenderer.invoke('run-python-script', scriptName, args),
  getNotePath: (noteId: string) => ipcRenderer.invoke('get-note-path', noteId),
});