import { useEffect, useRef, useState } from 'react';
import { MdPerson } from 'react-icons/md';
import { Sizes } from '../utils/Enums';
import { Tag } from '../utils/Types';
import ProfilePhoto from './ProfilePhoto';

interface Props {
  tags: Tag[];
}

export default function Tags({ tags }: Props) {
  const [viewTags, setViewTags] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setViewTags(false);
      }
    };

    if (viewTags) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewTags]);

  return (
    <>
      {tags && tags.length > 0 && (
        <div className="flex flex-row items-center gap-1 p-2" ref={ref}>
          <div
            className={`p-1 rounded-full shadow text-background duration-300 bg-foreground/60 hover:bg-foreground hover:opacity-100 cursor-pointer`}
            onClick={() => setViewTags((prev) => !prev)}
          >
            <MdPerson />
          </div>
          {tags.map((tag, index) => (
            <div
              className={`shadow-md rounded-full duration-300 ${!viewTags && 'opacity-0 pointer-events-none'}`}
              key={index}
            >
              <ProfilePhoto user={tag.user} size={Sizes.sm} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
