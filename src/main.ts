import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { setupFileSystem } from "./main/fileSystem";
import { runEmbeddingScript, runPythonScript } from "./main/pythonBridge";
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

const CSP = [
  "default-src 'self'",
  isDevelopment
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  isDevelopment ? "connect-src 'self' ws:" : "connect-src 'self'",
];

const createWindow = () => {
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
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools only in development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
};

// Set up IPC listeners for window controls
ipcMain.on("minimize-window", () => {
  mainWindow?.minimize();
});

ipcMain.on("maximize-window", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on("close-window", () => {
  mainWindow?.close();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  await setupFileSystem();
  await setupEmbeddingService();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Add error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  // Optionally, you can quit the app or show an error dialog
});

ipcMain.handle(
  "run-python-script",
  async (_, scriptName: string, args: string[]) => {
    try {
      const result = await runPythonScript(scriptName, args);
      return result;
    } catch (error) {
      console.error("Error running Python script:", error);
      throw error;
    }
  }
);

ipcMain.handle("find-similar-notes", async (_, query: string) => {
  try {
    const result = await runEmbeddingScript("find_similar", query);
    return result.similar_notes;
  } catch (error) {
    console.error("Error finding similar notes:", error);
    throw error;
  }
});

ipcMain.handle("get-top-level-folders", getTopLevelFolders);
ipcMain.handle("add-top-level-folder", async (_, folderPath) => {
  await addTopLevelFolder(folderPath);
  return getTopLevelFolders(); // Return updated list
});
ipcMain.handle("remove-top-level-folder", async (_, folderPath) => {
  await removeTopLevelFolder(folderPath);
  return getTopLevelFolders(); // Return updated list
});

// Folder selection dialog handler remains the same
ipcMain.handle("open-folder-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    buttonLabel: "Select Folder",
    title: "Select a folder to add as a top-level folder",
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});
