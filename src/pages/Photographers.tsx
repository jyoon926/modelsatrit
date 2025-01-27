/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../utils/Supabase';
import { Photographer } from '../utils/Types';
import PhotographerCard from '../components/PhotographerCard';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function Photographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>();

  useDocumentTitle('Photographers — Models @ RIT');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('photographer')
        .select('*, user:user(*, profile_photo:photo(*)), photos:photographer_photo(photo(*))');
      if (!error) {
        const reshapedData = data.map((photographer) => ({
          ...photographer,
          photos: photographer.photos.map((item: any) => item.photo),
        })).sort((a, b) => (a.user as any).name.localeCompare((b.user as any).name));
        setPhotographers(reshapedData);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-6xl sm:text-[8vw] font-serif border-b w-full mb-10">Photographers</h1>
        {photographers && (
          <div className="w-full flex flex-col gap-5">
            {photographers.map((photographer, index) => (
              <PhotographerCard photographer={photographer} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
