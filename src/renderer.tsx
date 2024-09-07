/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
"./index.css";

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DirectoryStructure, Note } from "./types";

declare global {
  interface Window {
    electron: {
      loadNotes: () => Promise<DirectoryStructure>;
      saveNote: (note: Note, dirPath: string) => Promise<void>;
      deleteNote: (noteId: string, dirPath: string) => Promise<void>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      runPythonScript: <T>(scriptName: string, args: string[]) => Promise<T>;
      findSimilarNotes: (query: string) => Promise<string[]>;
      saveEmbedding: (noteId: string, content: string) => Promise<void>;
      getOpenAIKey: () => Promise<string>;
      setOpenAIKey: (key: string) => Promise<void>;
      getNotePath: (noteId: string) => Promise<string>;
      createDirectory: (dirName: string) => Promise<void>;
      deleteDirectory: (dirName: string) => Promise<void>;
      getTopLevelFolders: () => Promise<string[]>;
      addTopLevelFolder: (folderPath: string) => Promise<void>;
      removeTopLevelFolder: (folderPath: string) => Promise<void>;
    };
  }
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log(
  '👋 This message is being logged by "renderer.tsx", included via Vite'
);
