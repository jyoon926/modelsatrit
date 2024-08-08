import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useEffect, useState } from 'react';
import { Model } from '../utils/Types';

export default function ModelPage() {
  const { email } = useParams();
  const [model, setModel] = useState<Model>();
  const [displayedPhoto, setDisplayedPhoto] = useState<string>();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from('models').select('*, user:users(*)').eq('user.email', email).single();
      if (!error) {
        setModel(data);
        setDisplayedPhoto(data.photos[0]);
      }
    };

    fetchUser();
  }, [email]);

  return (
    <>
      {model && (
        <div className="fade-in">
          <div className="w-full px-5 py-32 flex flex-col justify-start items-start gap-5">
            <p className="opacity-60">Model</p>
            <h1 className="text-7xl font-serif border-b w-full mb-10">{model.user.display_name}</h1>
            <div className="flex flex-row gap-10">
              <div
                className="h-[80vh] bg-cover bg-center rounded"
                style={{ backgroundImage: `url(${displayedPhoto})`, aspectRatio: '0.75' }}
              />
              <div className="flex flex-col justify-start items-start gap-10 leading-normal">
                <p className="max-w-[500px]">{model.user.bio}</p>
                <div className="flex flex-col gap-[1px]">
                  <div className="flex flex-row">
                    <p className="w-40 opacity-50">Instagram</p>
                    <Link className="w-40" to={'https://www.instagram.com/' + model.user.instagram} target="_blank">
                      @{model.user.instagram}
                    </Link>
                  </div>
                  <div className="flex flex-row">
                    <p className="w-40 opacity-50">Graduation year</p>
                    <p className="w-40">{model.user.graduation_year}</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="w-40 opacity-50">Gender</p>
                    <p className="w-40">{model.gender}</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="w-40 opacity-50">Race</p>
                    <p className="w-40">{model.race?.join(', ')}</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="w-40 opacity-50">Height</p>
                    <p className="w-40">{model.height}"</p>
                  </div>
                </div>
                <Link className="button sm" to={model.user.email}>
                  Email
                </Link>
                <div className="flex flex-row flex-wrap gap-3">
                  {model.photos.map((photo) => (
                    <div
                      className="w-32 bg-cover bg-center rounded hover:opacity-50 duration-300 cursor-pointer"
                      style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                      onClick={() => setDisplayedPhoto(photo)}
                      key={photo}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
