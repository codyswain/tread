import React, { useState } from 'react';
import FileExplorer from '@/features/fileExplorer/components/FileExplorer';
import { useNotes } from '../hooks/useNotes';
import RelatedNotes from './RelatedNotes';
import NoteEditor from './NoteEditor';

const NewNotesPage: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const {
    notes,
    directoryStructure,
    activeNote,
    similarNotes,
    createNote,
    saveNote,
    deleteNote,
    selectNote,
    findSimilarNotes,
  } = useNotes();

  const handleLeftSidebarResize = (width: number) => {
    setLeftSidebarWidth(width);
  };

  const handleRightSidebarResize = (width: number) => {
    setRightSidebarWidth(width);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <FileExplorer
        isOpen={isLeftSidebarOpen}
        directoryStructure={directoryStructure}
        selectedNote={activeNote}
        onSelectNote={selectNote}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onResize={handleLeftSidebarResize}
        onClose={() => setIsLeftSidebarOpen(false)}
        onCopyFilePath={() => {return null}} // TODO: Implement this function
        onOpenNoteInNewTab={() => {return null}} // TODO: Implement this function
        onCreateDirectory={() => {return null}} // TODO: Implement this function
        onDeleteDirectory={() => {return null}} // TODO: Implement this function
      />
      <main 
        className="flex-grow flex flex-col overflow-hidden"
        style={{
          marginLeft: isLeftSidebarOpen ? `${leftSidebarWidth}px` : '0',
          marginRight: isRightSidebarOpen ? `${rightSidebarWidth}px` : '0',
          transition: 'margin 0.3s ease-in-out',
        }}
      >
        {activeNote && (
          <NoteEditor
            note={notes.find(note => note.id === activeNote) || { id: '', title: '', content: '' }}
            onSave={saveNote}
          />
        )}
      </main>
      <RelatedNotes
        isOpen={isRightSidebarOpen}
        onResize={handleRightSidebarResize}
        onClose={() => setIsRightSidebarOpen(false)}
        currentNoteId={activeNote || ''}
        currentNoteContent={notes.find(note => note.id === activeNote)?.content || ''}
        onOpenNote={selectNote}
        isSimilarNotesLoading={false} // Implement loading state
        similarNotes={similarNotes}
      />
    </div>
  );
};

export default NewNotesPage;