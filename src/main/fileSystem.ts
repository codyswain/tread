import { ipcMain, app } from "electron";
import fs from "fs/promises";
import path from "path";
import { runEmbeddingScript } from "./pythonBridge";

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

  ipcMain.handle("load-notes", async () => {
    try {
      const files = await fs.readdir(NOTES_DIR);
      const notes = await Promise.all(
        files
          .filter(
            (file) =>
              file.endsWith(".json") && !file.endsWith(".embedding.json")
          )
          .map(async (file) => {
            const filePath = path.join(NOTES_DIR, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
              const content = await fs.readFile(filePath, "utf-8");
              return JSON.parse(content);
            }
            return null;
          })
      );
      return notes.filter((note) => note !== null);
    } catch (error) {
      console.error("Error loading notes:", error);
      throw error;
    }
  });

  ipcMain.handle("save-note", async (_, note) => {
    try {
      await fs.writeFile(
        path.join(NOTES_DIR, `${note.id}.json`),
        JSON.stringify(note)
      );
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

  ipcMain.handle("delete-note", async (_, noteId) => {
    try {
      await fs.unlink(path.join(NOTES_DIR, `${noteId}.json`));
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
