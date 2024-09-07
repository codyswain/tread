import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import path from 'path'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the folder name from a given path.
 * @param folderPath The full path of the folder.
 * @returns The name of the folder.
 */
export const getFolderName = (folderPath: string): string => {
  // Remove trailing slashes
  const cleanPath = folderPath.replace(/[/\\]$/, '');
  
  // Split the path and get the last part
  const parts = cleanPath.split(/[/\\]/);
  return parts[parts.length - 1];
};