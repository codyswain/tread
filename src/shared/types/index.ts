export interface NoteMetadata {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface NoteContent {
  content?: string
}

export interface Note extends NoteMetadata, NoteContent {}

export interface Directory {
  notes: Note[];
  // Consider adding a name field:
  name: string;
}

export interface DirectoryStructures {
  [key: string]: DirectoryStructure
}

export interface DirectoryStructure {
  name: string;
  type: 'directory' | 'note';
  children?: DirectoryStructure[];
  noteMetadata?: NoteMetadata;
  fullPath: string;
}

// SimilarNote can be replaced with Note since they have the same structure
export type SimilarNote = Note;

// Add a new type for tab information
export interface TabInfo {
  id: string;
  title: string;
}