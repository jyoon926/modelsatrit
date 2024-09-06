import { useEffect, useState, useRef } from 'react';
import { MdChevronLeft, MdChevronRight, MdClose, MdPerson } from 'react-icons/md';
import { Tag } from '../utils/Types';
import ProfilePhoto from './ProfilePhoto';
import { Sizes } from '../utils/Enums';

interface Props {
  photos: string[];
  selected: number;
  isOpen: boolean;
  onClose: () => void;
  tags?: Tag[];
}

export default function Slideshow({ photos, selected, isOpen, onClose, tags }: Props) {
  const [id, setId] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [viewTags, setViewTags] = useState(false);

  // Main slideshow functionality
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
      if (containerRef.current === event.target) handleClose();
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
  }, [isOpen]);

  // Tags position
  useEffect(() => {
    const repositionTags = () => {
      if (tagsRef.current && imageRef.current) {
        const image = imageRef.current;
        const tagsContainer = tagsRef.current;
        const imageRect = image.getBoundingClientRect();
        tagsContainer.style.left = `${imageRect.left}px`;
        tagsContainer.style.top = `${imageRect.bottom - tagsContainer.offsetHeight}px`;
      }
    };
    const observer = new ResizeObserver(repositionTags);
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    window.addEventListener('resize', repositionTags);
    repositionTags();
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
      window.removeEventListener('resize', repositionTags);
    };
  }, [imageRef, id, photos]);

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
          className={`slideshow-image absolute rounded-md ${id !== index && 'opacity-0 pointer-events-none'}`}
          src={photo}
          ref={id === index ? imageRef : null}
          alt={`Slide ${index + 1}`}
          key={index}
        />
      ))}

      {/* Close */}
      <button
        className="absolute top-0 right-0 m-3 p-2 rounded-full text-3xl duration-300 hover:bg-background/10"
        onClick={handleClose}
      >
        <MdClose />
      </button>

      {/* Controls */}
      <div className="absolute bottom-0 flex flex-row items-center justify-center">
        <button className="text-3xl p-4 rounded-full" onClick={() => setId(id - 1)} disabled={id === 0}>
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
        <button className="text-3xl p-4 rounded-full" onClick={() => setId(id + 1)} disabled={id === photos.length - 1}>
          <MdChevronRight />
        </button>
      </div>

      {tags && tags.length > 0 && (
        <div className="absolute flex flex-row items-center gap-1 p-2" ref={tagsRef}>
          <div
            className={`p-1 rounded-full shadow text-background duration-300 bg-foreground/80 hover:bg-foreground hover:opacity-100 cursor-pointer ${viewTags ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => setViewTags((prev) => !prev)}
          >
            <MdPerson />
          </div>
          {tags
            .filter((tag) => tag.photo_index === id)
            .map((tag, index) => (
              <div
                className={`shadow-md rounded-full duration-300 ${!viewTags && 'opacity-0 pointer-events-none'}`}
                key={index}
              >
                <ProfilePhoto user={tag.user} size={Sizes.sm} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
