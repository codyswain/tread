import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from 'fs';
import { setupFileSystem } from "./main/fileSystem";
import {
  addTopLevelFolder,
  getTopLevelFolders,
  removeTopLevelFolder,
} from "./main/configManager";
import { setupEmbeddingService } from "./main/embeddings";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const isDevelopment = process.env.NODE_ENV === "development";

// More lenient CSP
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: ws:",
  "media-src 'self' https:",
];

// Setup logging
const logFile = path.join(app.getPath('userData'), 'app.log');
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
};

const createWindow = () => {
  log('Creating main window');
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [CSP.join("; ")],
        },
      });
    }
  );

  // Load the main page (which will contain the navigation)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    log(`Loading URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    const filePath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    log(`Loading file: ${filePath}`);
    mainWindow.loadFile(filePath);
  }

  // Open the DevTools in development
  if (isDevelopment){
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    log('Main window finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    log(`Failed to load page: ${errorCode} - ${errorDescription}`);
  });
};

// Set up IPC listeners for window controls
ipcMain.on("minimize-window", () => {
  log('Minimizing window');
  mainWindow?.minimize();
});

ipcMain.on("maximize-window", () => {
  if (mainWindow?.isMaximized()) {
    log('Unmaximizing window');
    mainWindow.unmaximize();
  } else {
    log('Maximizing window');
    mainWindow?.maximize();
  }
});

ipcMain.on("close-window", () => {
  log('Closing window');
  mainWindow?.close();
});

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  log('App is ready, setting up...');
  try {
    await setupFileSystem();
    log('File system setup complete');
    await setupEmbeddingService();
    log('Embedding service setup complete');
    createWindow();
  } catch (error) {
    log(`Error during app setup: ${error}`);
  }
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    log('All windows closed, quitting app');
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    log('Activating app, creating new window');
    createWindow();
  }
});

// Add error handling
process.on("uncaughtException", (error) => {
  log(`Uncaught exception: ${error}`);
  dialog.showErrorBox('An error occurred', error.message);
});

// IPC handlers for top-level folder management
ipcMain.handle("get-top-level-folders", async () => {
  log('Getting top-level folders');
  return getTopLevelFolders();
});

ipcMain.handle("add-top-level-folder", async (_, folderPath) => {
  log(`Adding top-level folder: ${folderPath}`);
  await addTopLevelFolder(folderPath);
  return getTopLevelFolders();
});

ipcMain.handle("remove-top-level-folder", async (_, folderPath) => {
  log(`Removing top-level folder: ${folderPath}`);
  await removeTopLevelFolder(folderPath);
  return getTopLevelFolders();
});

// Folder selection dialog handler
ipcMain.handle("open-folder-dialog", async () => {
  log('Opening folder dialog');
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    buttonLabel: "Select Folder",
    title: "Select a folder to add as a top-level folder",
  });

  if (!result.canceled && result.filePaths.length > 0) {
    log(`Folder selected: ${result.filePaths[0]}`);
    return result.filePaths[0];
  }
  log('Folder selection cancelled');
  return null;
});