import { useEffect, useRef, useState } from 'react';
import { MdMoreVert } from 'react-icons/md';

interface Props {
  children: React.ReactNode;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function OptionsMenu({ children, onClose, onOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const handleToggle = () => {
    if (!isOpen) handleOpen();
    else handleClose();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex flex-col items-end justify-start" ref={ref}>
      <button onClick={handleToggle} className="p-1 duration-300 hover:bg-foreground/10 rounded">
        <MdMoreVert className="text-2xl opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute mt-10 rounded border bg-background flex flex-col shadow-md" onClick={handleClose}>
          {children}
        </div>
      )}
    </div>
  );
}
