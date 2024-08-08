import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useEffect, useState } from 'react';
import { Photographer } from '../utils/Types';
import ProfilePhoto from '../components/ProfilePhoto';
import { Sizes } from '../utils/Enums';

export default function PhotographerPage() {
  const { email } = useParams();
  const [photographer, setPhotographer] = useState<Photographer>();
  const [displayedPhoto, setDisplayedPhoto] = useState<string>();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*, user:users(*)')
        .eq('user.email', email)
        .single();
      if (!error) {
        setPhotographer(data);
        setDisplayedPhoto(data.photos[0]);
      }
    };

    fetchUser();
  }, [email]);

  return (
    <>
      {photographer && (
        <div className="fade-in">
          <div className="w-full px-5 py-32 flex flex-col justify-start items-start gap-5">
            <p className="opacity-60">Photographer</p>
            <div className="flex flex-row items-end border-b w-full mb-10 gap-5">
              <div className="mb-2">
                <ProfilePhoto user={photographer.user} size={Sizes.xl} />
              </div>
              <h1 className="text-7xl font-serif">{photographer.user.display_name}</h1>
            </div>
            <div className="flex flex-row gap-10">
              <div
                className="h-[80vh] bg-cover bg-center rounded"
                style={{ backgroundImage: `url(${displayedPhoto})`, aspectRatio: '0.75' }}
              />
              <div className="flex flex-col justify-start items-start gap-10 leading-normal">
                <p className="leading-normal max-w-[500px]">{photographer.user.bio}</p>
                <div className="flex flex-col gap-[1px]">
                  <div className="flex flex-row">
                    <p className="w-36 opacity-50">Instagram</p>
                    <Link
                      className="w-40"
                      to={'https://www.instagram.com/' + photographer.user.instagram}
                      target="_blank"
                    >
                      @{photographer.user.instagram}
                    </Link>
                  </div>
                  <div className="flex flex-row">
                    <p className="w-36 opacity-50">Graduation year</p>
                    <p className="w-40">{photographer.user.graduation_year}</p>
                  </div>
                </div>
                <Link className="button sm" to={`mailto:${photographer.user.email}`}>
                  Email
                </Link>
                <div className="flex flex-row flex-wrap gap-3">
                  {photographer.photos.map((photo) => (
                    <div
                      className="h-48 bg-cover bg-center rounded hover:opacity-50 duration-300 cursor-pointer"
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
