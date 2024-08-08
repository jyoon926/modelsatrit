import React, { useEffect, useRef, useState } from 'react';
import { MdClose } from 'react-icons/md';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current === event.target) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleClickOutside);
      setTimeout(() => setIsVisible(true), 50); // Delay to ensure transition works
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-foreground/70 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      ref={containerRef}
    >
      <div className="bg-background rounded shadow-lg p-4 flex flex-col items-start justify-start">
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <p className="opacity-60">{title}</p>
          <button onClick={onClose} className="text-right text-xl font-bold">
            <MdClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
