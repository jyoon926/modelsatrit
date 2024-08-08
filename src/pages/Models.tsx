import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { Model } from '../utils/Types';

export default function Models() {
  const [models, setModels] = useState<Model[]>();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('models').select('*, user:users(*)');
      if (!error) {
        setModels(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        <h1 className="text-[8vw] font-serif border-b w-full mb-10">Models</h1>
        {models && (
          <div className="w-full grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {models.map((model) => (
              <Link className="w-full" to={`/models/${model.user.email}`} key={model.model_id}>
                <div
                  className="w-full bg-cover bg-center rounded"
                  style={{ backgroundImage: `url(${model.photos[0]})`, aspectRatio: '0.75' }}
                ></div>
                <p className="font-serif mt-3 text-2xl">{model.user.display_name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
