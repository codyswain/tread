import { useState, useEffect, useRef, useCallback } from 'react';

interface UseResizableSidebarProps {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  isOpen: boolean;
  onResize: (width: number) => void;
  onClose: () => void;
}

export const useResizableSidebar = ({
  minWidth,
  maxWidth,
  defaultWidth,
  isOpen,
  onResize,
  onClose,
}: UseResizableSidebarProps) => {
  const [width, setWidth] = useState(defaultWidth);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    
    const newWidth = e.clientX - (sidebarRef.current?.getBoundingClientRect().left || 0);
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
      onResize(newWidth);
    } else if (newWidth < minWidth) {
      setWidth(0);
      onResize(0);
      onClose();
    }
  }, [minWidth, maxWidth, onResize, onClose]);

  useEffect(() => {
    if (isOpen) {
      setWidth(defaultWidth);
      onResize(defaultWidth);
    } else {
      setWidth(0);
      onResize(0);
    }
  }, [isOpen, defaultWidth, onResize]);

  return { width, sidebarRef, startResizing };
};