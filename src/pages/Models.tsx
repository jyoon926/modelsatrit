/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../utils/Supabase';
import { Link } from 'react-router-dom';
import Filters from '../components/Filters';
import useDocumentTitle from '../utils/useDocumentTitle';

interface Model {
  photos: any[];
  user: any;
}

export default function Models() {
  const [models, setModels] = useState<Model[]>();
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [raceFilters, setRaceFilters] = useState<string[]>([]);

  useDocumentTitle('Models — Models @ RIT');

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase
        .from('model')
        .select('user:user(name, email), photos:model_photo(photo(medium))')
        .limit(1, { foreignTable: 'model_photo' });
      if (genderFilters.length > 0) query = query.in('gender', genderFilters);
      if (raceFilters.length > 0) {
        const orQuery = raceFilters.map((race) => `race.cs.{${race}}`).join(',');
        query = query.or(orQuery);
      }
      const { data, error } = await query;
      if (!error && data) {
        const reshapedData = data
          .map(({ user, photos }) => ({
            user,
            photos: photos.map(({ photo }) => photo),
          }))
          .sort((a, b) => (a.user as any).name.localeCompare((b.user as any).name));
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
              (model, index) =>
                model.photos.length > 0 && (
                  <Link className="w-full" to={`/profile/${model.user.email}/model`} key={index}>
                    <div
                      className="w-full bg-cover bg-no-repeat bg-center rounded bg-foreground/5"
                      style={{ backgroundImage: `url("${model.photos[0].medium}")`, aspectRatio: '0.75' }}
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
