import { ipcMain, app } from "electron";
import fs from "fs/promises";
import path from "path";
import { runEmbeddingScript } from "./pythonBridge";
import { DirectoryStructure, Note } from "@/types";

export const NOTES_DIR = path.join(app.getPath("userData"), "notes");

// Create a config file path
const CONFIG_FILE = path.join(app.getPath("userData"), "config.json");

export const setupFileSystem = async () => {
  // Ensure the notes directory exists
  await fs.mkdir(NOTES_DIR, { recursive: true });

  // Ensure the config file exists
  try {
    await fs.access(CONFIG_FILE);
  } catch {
    await fs.writeFile(CONFIG_FILE, JSON.stringify({}));
  }

  // Modify the existing loadNotes function
  ipcMain.handle("load-notes", async () => {
    try {
      return await loadDirectoryStructure();
    } catch (error) {
      console.error("Error loading notes:", error);
      throw error;
    }
  });

  // Add new IPC handlers
  ipcMain.handle("create-directory", async (_, dirName: string) => {
    try {
      await createDirectory(dirName);
    } catch (error) {
      console.error("Error creating directory:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-directory", async (_, dirPath: string) => {
    try {
      await deleteDirectory(dirPath);
    } catch (error) {
      console.error("Error deleting directory:", error);
      throw error;
    }
  });

  ipcMain.handle("save-note", async (_, note, dirPath = "") => {
    try {
      const notePath = path.join(NOTES_DIR, dirPath, `${note.id}.json`);
      await fs.mkdir(path.dirname(notePath), { recursive: true });
      await fs.writeFile(notePath, JSON.stringify(note));
      return notePath;
    } catch (error) {
      console.error("Error saving note:", error);
      throw error;
    }
  });

  ipcMain.handle("save-embedding", async (_, noteId, content) => {
    try {
      await runEmbeddingScript("compute", noteId, content);
    } catch (error) {
      console.error("Error saving embedding:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-note", async (_, noteId, dirPath = "") => {
    try {
      const notePath = path.join(NOTES_DIR, dirPath, `${noteId}.json`);
      await fs.unlink(notePath);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  });

  ipcMain.handle("get-note-path", async (_, noteId) => {
    return path.join(NOTES_DIR, `${noteId}.json`);
  });

  ipcMain.handle("get-openai-key", async () => {
    try {
      const config = await fs.readFile(CONFIG_FILE, "utf-8");
      return JSON.parse(config).openaiApiKey || "";
    } catch (error) {
      console.error("Error reading OpenAI API key:", error);
      return "";
    }
  });

  ipcMain.handle("set-openai-key", async (_, key: string) => {
    try {
      const config = { openaiApiKey: key };
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving OpenAI API key:", error);
      throw error;
    }
  });
};

export const getOpenAIKey = async (): Promise<string> => {
  try {
    const config = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(config).openaiApiKey || "";
  } catch (error) {
    console.error("Error reading OpenAI API key:", error);
    return "";
  }
};

const createDirectory = async (dirPath: string) => {
  const fullPath = path.join(NOTES_DIR, dirPath);
  await fs.mkdir(fullPath, { recursive: true });
};

const deleteDirectory = async (dirPath: string) => {
  const fullPath = path.join(NOTES_DIR, dirPath);
  await fs.rm(fullPath, { recursive: true, force: true });
};

const loadDirectoryStructure = async (): Promise<DirectoryStructure> => {
  const readDir = async (dir: string): Promise<DirectoryStructure> => {
    const name = path.basename(dir);
    const structure: DirectoryStructure = {
      name,
      type: "directory",
      children: [],
    };
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        structure.children!.push(await readDir(path.join(dir, entry.name)));
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".json") &&
        !entry.name.endsWith(".embedding.json")
      ) {
        const filePath = path.join(dir, entry.name);
        const content = await fs.readFile(filePath, "utf-8");
        const note: Note = JSON.parse(content);
        structure.children!.push({ name: note.title, type: "note", note });
      }
    }

    return structure;
  };

  return await readDir(NOTES_DIR);
};
