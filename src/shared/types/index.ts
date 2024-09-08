export interface Note {
  id: string;
  title: string;
  content: string;
  // Consider adding optional fields if needed, e.g.:
  // lastModified?: Date;
  // tags?: string[];
}

export interface Directory {
  notes: Note[];
  // Consider adding a name field:
  name: string;
}

export interface DirectoryStructure {
  name: string;
  type: 'directory' | 'note';
  children?: DirectoryStructure[];
  note?: Note;
}

// SimilarNote can be replaced with Note since they have the same structure
export type SimilarNote = Note;

// Add a new type for tab information
export interface TabInfo {
  id: string;
  title: string;
}