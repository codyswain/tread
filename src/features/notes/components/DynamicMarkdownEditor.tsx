// src/features/notes/components/DynamicMarkdownEditor.tsx

import React, { useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';
import { markdownToHtml } from '@/features/notes/utils/markdownUtils'

interface DynamicMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DynamicMarkdownEditor: React.FC<DynamicMarkdownEditorProps> = ({
  value,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      // Get the raw markdown text from the editor
      const content = editorRef.current.innerText;
      onChange(content);

      // Parse markdown to HTML and set it as the editor's content
      const htmlContent = markdownToHtml(content);
      editorRef.current.innerHTML = htmlContent;

      // Move cursor to the end
      placeCaretAtEnd(editorRef.current);
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      className="prose dark:prose-invert max-w-none border rounded-md p-4 h-full bg-muted/50 overflow-auto focus:outline-none"
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
    />
  );
};

export default DynamicMarkdownEditor;

// Helper functions
function placeCaretAtEnd(el: HTMLElement) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
