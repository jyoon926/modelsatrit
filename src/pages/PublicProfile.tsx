import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Model, Photographer, User } from '../utils/Types';
import { supabase } from '../supabase';
import { useAuth } from '../utils/AuthContext';
import ProfilePhoto from '../components/ProfilePhoto';
import { Sizes } from '../utils/Enums';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { email } = useParams();
  const [user, setUser] = useState<User>();
  const [model, setModel] = useState<Model>();
  const [photographer, setPhotographer] = useState<Photographer>();
  const [tab, setTab] = useState<number>(0);

  const getModel = async (user_id: number) => {
    const { data, error } = await supabase.from('models').select('*').eq('user_id', user_id).single();
    if (!error) {
      setModel(data);
    }
  };

  const getPhotographer = async (user_id: number) => {
    const { data, error } = await supabase.from('photographers').select('*').eq('user_id', user_id).single();
    if (!error) {
      setPhotographer(data);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (email) {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (!error) {
          setUser(data);
          getModel(data.user_id);
          getPhotographer(data.user_id);
        }
      }
    };
    fetchUser();
  }, [email]);

  return user ? (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        {/* Name */}
        <div className="flex flex-row items-end border-b w-full mb-10 gap-5">
          <div className="mb-2">
            <ProfilePhoto user={user} size={Sizes.xl} />
          </div>
          <h1 className="text-7xl font-serif">{user.display_name}</h1>
        </div>
        <div className="w-full flex flex-row justify-start items-start gap-10">
          {/* Basic info panel */}
          <div className="p-5 border rounded w-96 flex flex-col items-start gap-5 leading-snug">
            {user.bio && (
              <div>
                <div className="opacity-60 pb-1">Bio</div>
                <div>{user.bio}</div>
              </div>
            )}
            {user.graduation_year && (
              <div>
                <div className="opacity-60 pb-1">Graduation Year</div>
                <div>{user.graduation_year}</div>
              </div>
            )}
            {user.instagram && (
              <div>
                <div className="opacity-60 pb-1">Instagram</div>
                <Link to={'https://www.instagram.com/' + user.instagram} target="_blank">
                  @{user.instagram}
                </Link>
              </div>
            )}
            {authUser?.email === email && (
              <div className="flex flex-row gap-3">
                <Link className="button light sm" to={'/profile'}>
                  Edit Profile
                </Link>
                <button className="button light sm" onClick={logout}>
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-row gap-3 font-serif text-xl">
              {model && (
                <button className={'button sm border ' + (tab !== 0 && 'transparent')} onClick={() => setTab(0)}>
                  Model Profile
                </button>
              )}
              {photographer && (
                <button className={'button sm border ' + (tab !== 1 && 'transparent')} onClick={() => setTab(1)}>
                  Photographer Profile
                </button>
              )}
            </div>

            {/* Model page */}
            {model && tab === 0 && (
              <>
                <p className="mt-5 font-bold">Model Information</p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-5">
                    <p className="w-32 opacity-60">Gender</p>
                    <p className="">{model?.gender}</p>
                  </div>
                  <div className="flex flex-row gap-5">
                    <p className="w-32 opacity-50">Race</p>
                    <p className="">{model.race?.join(', ')}</p>
                  </div>
                  <div className="flex flex-row gap-5">
                    <p className="w-32 opacity-60">Height</p>
                    <p className="w-40">{model.height}"</p>
                  </div>
                </div>
                <p className="font-bold mt-5">Photos</p>
                <div
                  className="w-full grid gap-5"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
                >
                  {model.photos.map((photo) => (
                    <div
                      className="w-full rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                      key={photo}
                    ></div>
                  ))}
                </div>
              </>
            )}

            {/* Photographer page */}
            {photographer && tab === 1 && (
              <>
                <p className="font-bold">Photos</p>
                <div
                  className="w-full grid gap-5"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
                >
                  {photographer.photos.map((photo) => (
                    <div
                      className="w-full rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                      key={photo}
                    ></div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
