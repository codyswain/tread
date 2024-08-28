import { ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";

const NOTES_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  ".my-notes-app"
);

export const setupFileSystem = () => {
  ipcMain.handle("load-notes", async () => {
    try {
      await fs.mkdir(NOTES_DIR, { recursive: true });
      const files = await fs.readdir(NOTES_DIR);
      const notes = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(
            path.join(NOTES_DIR, file),
            "utf-8"
          );
          return JSON.parse(content);
        })
      );
      return notes;
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

  ipcMain.handle("delete-note", async (_, noteId) => {
    try {
      await fs.unlink(path.join(NOTES_DIR, `${noteId}.json`));
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  });
};
