import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Photographer } from '../utils/Types';
import PhotographerCard from '../components/PhotographerCard';

export default function Photographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('photographers').select('*, user:users(*)');
      if (!error) {
        setPhotographers(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-5xl sm:text-[8vw] font-serif border-b w-full mb-10">Photographers</h1>
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
