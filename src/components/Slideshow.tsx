import { useEffect, useState, useRef } from 'react';
import { MdChevronLeft, MdChevronRight, MdClose } from 'react-icons/md';

interface Props {
  photos: string[];
  selected: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Slideshow({ photos, selected, isOpen, onClose }: Props) {
  const [id, setId] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setId(selected);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'ArrowLeft') {
        setId((prevId) => Math.max(prevId - 1, 0));
      } else if (event.key === 'ArrowRight') {
        setId((prevId) => Math.min(prevId + 1, photos.length - 1));
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
      document.body.style.overflowY = 'hidden';
      setTimeout(() => setIsVisible(true), 50); // Delay to ensure transition works
    } else {
      document.body.style.overflowY = 'scroll';
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
      ref={containerRef}
      className={`fixed inset-0 flex items-center justify-center z-50 bg-foreground/80 backdrop-blur-sm text-background transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Photos */}
      {photos.map((photo, index) => (
        <img
          className={`max-h-[80vh] max-w-[80vw] absolute rounded ${id !== index && 'opacity-0 pointer-events-none'}`}
          src={photo}
          key={index}
          alt={`Slide ${index + 1}`}
        />
      ))}

      {/* Close */}
      <button className="absolute top-0 right-0 p-5 rounded-full text-3xl" onClick={handleClose}>
        <MdClose />
      </button>

      <div className="absolute bottom-0 flex flex-row items-center justify-center">
        <button className="text-4xl p-5 rounded-full" onClick={() => setId(id - 1)} disabled={id === 0}>
          <MdChevronLeft />
        </button>
        <div className="flex flex-row gap-2 bg-background/10 p-2 rounded-full">
          {photos.map((_, index) => (
            <button
              className={'h-2 w-2 rounded-full' + (id === index ? ' bg-background' : ' bg-background/25')}
              onClick={() => setId(index)}
              key={index}
            />
          ))}
        </div>
        <button className="text-4xl p-5 rounded-full" onClick={() => setId(id + 1)} disabled={id === photos.length - 1}>
          <MdChevronRight />
        </button>
      </div>
    </div>
  );
}
