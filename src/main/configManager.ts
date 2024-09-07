import { app } from "electron";
import fs from "fs/promises";
import path from "path";

interface Config {
  topLevelFolders: string[];
}

const CONFIG_FILE = path.join(app.getPath("userData"), "config.json");

async function readConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist, return default config
      return { topLevelFolders: [] };
    }
    throw error;
  }
}

async function writeConfig(config: Config): Promise<void> {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function getTopLevelFolders(): Promise<string[]> {
  const config = await readConfig();
  return config.topLevelFolders;
}

export async function addTopLevelFolder(folderPath: string): Promise<void> {
  const config = await readConfig();
  if (!config.topLevelFolders.includes(folderPath)) {
    config.topLevelFolders.push(folderPath);
    await writeConfig(config);
  }
}

export async function removeTopLevelFolder(folderPath: string): Promise<void> {
  const config = await readConfig();
  config.topLevelFolders = config.topLevelFolders.filter(
    (path) => path !== folderPath
  );
  await writeConfig(config);
}
