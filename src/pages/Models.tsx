import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { Model } from '../utils/Types';
import Filters from '../components/Filters';

export default function Models() {
  const [models, setModels] = useState<Model[]>();
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [raceFilters, setRaceFilters] = useState<string[]>([]);

  const fetchData = async () => {
    let query = supabase.from('models').select('*, user:users(*)');
    if (genderFilters.length > 0) query = query.in('gender', genderFilters);
    if (raceFilters.length > 0) {
      const orQuery = raceFilters.map((race) => `race.cs.{${race}}`).join(',');
      query = query.or(orQuery);
    }
    const { data, error } = await query;
    if (!error) setModels(data);
  };

  useEffect(() => {
    fetchData();
  }, [genderFilters, raceFilters]);

  const onFiltersUpdate = (_genderFilters: string[], _raceFilters: string[]) => {
    setGenderFilters(_genderFilters);
    setRaceFilters(_raceFilters);
  };

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start gap-5">
        <h1 className="text-5xl sm:text-[8vw] font-serif border-b w-full">Models</h1>
        <Filters onFiltersUpdate={onFiltersUpdate} />
        {models && (
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {models.map(
              (model) =>
                model.photos && (
                  <Link className="w-full" to={`/profile/${model.user.email}/model`} key={model.model_id}>
                    <div
                      className="w-full bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${model.photos[0]})`, aspectRatio: '0.75' }}
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
