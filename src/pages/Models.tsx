/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { Model } from '../utils/Types';
import Filters from '../components/Filters';

export default function Models() {
  const [models, setModels] = useState<Model[]>();
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [raceFilters, setRaceFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from('model').select('*, user:user(*), photos:model_photo(photo(*))');
      if (genderFilters.length > 0) query = query.in('gender', genderFilters);
      if (raceFilters.length > 0) {
        const orQuery = raceFilters.map((race) => `race.cs.{${race}}`).join(',');
        query = query.or(orQuery);
      }
      const { data, error } = await query;
      if (!error) {
        const reshapedData = data.map((model) => ({ ...model, photos: model.photos.map((item: any) => item.photo) }));
        setModels(reshapedData);
      }
    };

    fetchData();
  }, [genderFilters, raceFilters]);

  const onFiltersUpdate = (_genderFilters: string[], _raceFilters: string[]) => {
    setGenderFilters(_genderFilters);
    setRaceFilters(_raceFilters);
  };

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start gap-5">
        <h1 className="text-6xl sm:text-[8vw] font-serif border-b w-full">Models</h1>
        <Filters onFiltersUpdate={onFiltersUpdate} />
        {models && (
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {models.map(
              (model) =>
                model.photos.length > 0 && (
                  <Link className="w-full" to={`/profile/${model.user.email}/model`} key={model.id}>
                    <div
                      className="w-full bg-cover bg-no-repeat bg-center rounded bg-foreground/5"
                      style={{ backgroundImage: `url(${model.photos[0].medium})`, aspectRatio: '0.75' }}
                    />
                    <p className="font-serif mt-3 text-2xl">{model.user.name}</p>
                  </Link>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
