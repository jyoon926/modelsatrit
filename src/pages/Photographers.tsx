import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { Photographer } from '../utils/Types';

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
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {photographers.map(
              (photographer) =>
                photographer.photos && (
                  <Link
                    className="w-full"
                    to={`/profile/${photographer.user.email}/photographer`}
                    key={photographer.photographer_id}
                  >
                    <div
                      className="w-full bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${photographer.photos[0]})`, aspectRatio: '0.75' }}
                    ></div>
                    <p className="font-serif mt-3 text-2xl">{photographer.user.display_name}</p>
                  </Link>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
