import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizablePaneProps {
  minHeight: number;
  maxHeight: number;
  defaultHeight: number;
  isOpen: boolean;
  onResize: (height: number) => void;
  onClose: () => void;
}

export const useResizablePane = ({
  minHeight,
  maxHeight,
  defaultHeight,
  isOpen,
  onResize,
  onClose,
}: UseResizablePaneProps) => {
  const [height, setHeight] = useState(defaultHeight);
  const paneRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setHeight(newHeight);
      onResize(newHeight);
    }
  }, [minHeight, maxHeight, onResize]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  }, [resize]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return { height, paneRef, startResizing };
};
