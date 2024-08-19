import { Link } from 'react-router-dom';
import { Sizes } from '../utils/Enums';
import { Photographer } from '../utils/Types';
import ProfilePhoto from './ProfilePhoto';
import Slideshow from './Slideshow';
import { useState } from 'react';

interface Props {
  photographer: Photographer;
}

export default function PhotographerCard({ photographer }: Props) {
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowId, setSlideshowId] = useState(0);

  const handlePhotoClick = (index: number) => {
    setSlideshowId(index);
    setIsSlideshowOpen(true);
  };

  return (
    <div className="w-full border rounded-xl px-3 py-5 sm:px-5 flex flex-col gap-5">
      <div className="w-full flex flex-col gap-5 sm:flex-row items-start sm:items-center justify-between">
        <div className="flex flex-row gap-3 items-center">
          <ProfilePhoto user={photographer.user} size={Sizes.lg} />
          <div>
            <div className="font-serif text-2xl leading-none">{photographer.user.name}</div>
            {photographer.user.major && (
              <div className="font-sans text-sm opacity-60 leading-none">
                {photographer.user.major}
                {photographer.user.graduation_year && ', Class of ' + photographer.user.graduation_year}
              </div>
            )}
          </div>
        </div>
        <Link
          className="button sm light flex items-center text-nowrap"
          to={`/profile/${photographer.user.email}/photographer`}
        >
          View Profile
        </Link>
      </div>
      {photographer.photos && photographer.photos.length ? (
        <div className="w-full flex flex-row gap-3 overflow-x-auto slim-scrollbar">
          {photographer.photos.map((photo, index) => (
            <img
              className="h-60 bg-cover bg-center rounded cursor-pointer"
              src={photo}
              key={index}
              onClick={() => handlePhotoClick(index)}
            />
          ))}
        </div>
      ) : (
        <div className="opacity-60 skew-x-[-10deg]">No photos.</div>
      )}
      <Slideshow
        photos={photographer.photos}
        selected={slideshowId}
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
      />
    </div>
  );
}
