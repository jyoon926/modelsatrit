import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Photographer } from '../utils/Types';
import PhotographerCard from '../components/PhotographerCard';

export default function Photographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('photographer')
        .select('*, user:user(*, profile_photo:photo(*)), photos:photographer_photo(photo(*))');
      if (!error) {
        const reshapedData = data.map((photographer) => ({
          ...photographer,
          photos: photographer.photos.map((item: any) => item.photo),
        }));
        console.log(reshapedData);
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
