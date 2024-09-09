import { ipcMain, app } from "electron";
import fs from "fs/promises";
import path from "path";
import { runEmbeddingScript } from "./pythonBridge";
import { DirectoryStructure, Note } from "@/shared/types";
import { v4 as uuidv4 } from "uuid";

// Special delimiter used for parsing notes from non-notes
const NOTE_DELIMITER = "___";
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

  ipcMain.handle("load-notes", async (_, dirPath: string) => {
    try {
      return await loadDirectoryStructure(dirPath);
    } catch (error) {
      console.error("Error loading notes:", error);
      throw error;
    }
  });

  // Load a single note based on path
  ipcMain.handle("load-note", async (_, notePath: string) => {
    try {
      const noteContent = await fs.readFile(notePath, "utf-8");
      const note: Note = JSON.parse(noteContent);
      console.log(
        `Note loaded successfully: id=${note.id}, title=${note.title}`
      );
      return note;
    } catch (error) {
      console.error("Error loading note:", error);
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

  ipcMain.handle("save-note", async (_, note: Note, filePath: string) => {
    try {
      const dirPath = path.dirname(filePath);
      const sanitizedTitle = sanitizeFilename(note.title);
      const fileName = `${note.id}${NOTE_DELIMITER}${sanitizedTitle}.json`;
      const notePath = path.join(dirPath, fileName);
  
      // Ensure the directory exists
      await fs.mkdir(dirPath, { recursive: true });
  
      // Write the note to the file
      await fs.writeFile(notePath, JSON.stringify(note));
      console.log(`Note saved successfully with notePath=${notePath}`);
      return notePath;
    } catch (error) {
      console.error("Error saving note:", error);
      throw error;
    }
  });

  ipcMain.handle("update-note", async (_, updatedNote: Note, prevFilePath: string) => {
    try {
      const dirPath = path.dirname(prevFilePath);
      const sanitizedTitle = sanitizeFilename(updatedNote.title);
      const newFileName = `${updatedNote.id}${NOTE_DELIMITER}${sanitizedTitle}.json`;
      const newNotePath = path.join(dirPath, newFileName);
  
      // Rename the file if the path has changed
      if (prevFilePath !== newNotePath) {
        await fs.rename(prevFilePath, newNotePath);
      }
  
      // Update the note content
      await fs.writeFile(newNotePath, JSON.stringify(updatedNote));
  
      console.log(`Note updated successfully with new path=${newNotePath}`);
      return newNotePath;
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  });
  

  ipcMain.handle("save-embedding", async (_, note: Note, dirPath = "") => {
    try {
      const embeddingPath = path.join(dirPath, `${note.id}.embedding.json`);
      const embeddingContent = note.title + note.content; // TODO: improve this
      await runEmbeddingScript("compute", embeddingPath, embeddingContent);
    } catch (error) {
      console.error("Error saving embedding:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-note", async (_, noteId, dirPath = "") => {
    try {
      const files = await fs.readdir(dirPath);
      const noteFile = files.find(
        (file) =>
          file.startsWith(`${noteId}${NOTE_DELIMITER}`) &&
          file.endsWith(".json")
      );
      if (noteFile) {
        const notePath = path.join(dirPath, noteFile);
        await fs.unlink(notePath);
      } else {
        throw new Error(`Note with id ${noteId} not found in ${dirPath}`);
      }
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

  ipcMain.handle("get-directory-structure", async (_, dirPath: string) => {
    try {
      const dirStructure = await loadDirectoryStructure(dirPath);
      return dirStructure;
    } catch (error) {
      console.error(`error loading directory structure for dirPath=${dirPath}`);
    }
  });

  ipcMain.handle("delete-file-node", async (_, fileNodeType: string, fileNodePath: string) => {
    if (fileNodeType === "directory") {
      try {
        await fs.rm(fileNodePath, { recursive: true, force: true });
      } catch (err) {
        console.error(`Error deleting directory fileNode with path: ${fileNodePath}`);
      }
    } else if (fileNodeType === "note") {
      try {
        await fs.unlink(fileNodePath);
      } catch (err) {
        console.error(`Error deleting note fileNode with fileNodePath: ${fileNodePath}`);
      }
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

// Recursively create node representation of a directory
const loadDirectoryStructure = async (
  dirPath: string
): Promise<DirectoryStructure> => {
  const dirName = path.basename(dirPath);
  const structure: DirectoryStructure = {
    name: dirName,
    type: "directory",
    children: [],
    fullPath: dirPath,
  };

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const childPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      structure.children?.push(await loadDirectoryStructure(childPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      !entry.name.endsWith(".embedding.json")
    ) {
      const [id, ...titleParts] = entry.name.slice(0, -5).split(NOTE_DELIMITER);

      const title = titleParts.join(NOTE_DELIMITER);
      console.log(`Loaded note with id=${id}, title=${title}`);

      structure.children?.push({
        name: title,
        type: "note",
        noteMetadata: {
          id,
          title,
        },
        fullPath: childPath,
      });
    }
  }

  return structure;
};

const deleteFileNode = async (fileNodeType: string, fileNodePath: string) => {
  if (fileNodeType === "directory") {
    try {
      await fs.rm(fileNodePath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Error deleting directory fileNode with path: ${fileNodePath}`);
    }
  } else if (fileNodeType === "note") {
    try {
      await fs.unlink(fileNodePath);
    } catch (err) {
      console.error(`Error deleting note fileNode with fileNodePath: ${fileNodePath}`);
    }
  }
};

export function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
