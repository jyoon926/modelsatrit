import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Model, Photographer, User } from '../utils/Types';
import { supabase } from '../supabase';
import { useAuth } from '../utils/AuthContext';
import ProfilePhoto from '../components/ProfilePhoto';
import { Sizes } from '../utils/Enums';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { email } = useParams();
  const { tab } = useParams();
  const [user, setUser] = useState<User>();
  const [model, setModel] = useState<Model>();
  const [photographer, setPhotographer] = useState<Photographer>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  const fetchUser = async () => {
    console.log('Fetch');
    if (email) {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (!error) {
        setUser(data);
        await getModel(data.user_id);
        await getPhotographer(data.user_id);
      }
      setLoading(false);
    }
  };

  const checkTab = () => {
    if (!tab) {
      if (model) navigate(`/profile/${email}/model`);
      else if (photographer) navigate(`/profile/${email}/photographer`);
      return;
    }

    if (tab === 'model' && !model) {
      return navigate(`/profile/${email}${photographer ? '/photographer' : ''}`);
    }

    if (tab === 'photographer' && !photographer) {
      return navigate(`/profile/${email}${model ? '/model' : ''}`);
    }

    if (tab !== 'model' && tab !== 'photographer') {
      if (model) return navigate(`/profile/${email}/model`);
      if (photographer) return navigate(`/profile/${email}/photographer`);
      return navigate(`/profile/${email}`);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [email]);

  useEffect(() => {
    if (loading) return;
    checkTab();
  }, [loading]);

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
        <div className="w-full flex flex-row justify-start items-start gap-7">
          {/* Basic info panel */}
          <div className="w-[300px] flex flex-col gap-5">
            <div className="w-full p-5 border rounded flex flex-col items-start gap-5 leading-snug">
              <p className="font-serif text-2xl">Basic Information</p>
              {user.email && (
                <div>
                  <p className="opacity-60 pb-1">Email</p>
                  <Link className="link" to={`mailto:${user.email}`}>
                    {user.email}
                  </Link>
                </div>
              )}
              {user.bio && (
                <div>
                  <p className="opacity-60 pb-1">Bio</p>
                  <p>{user.bio}</p>
                </div>
              )}
              {user.graduation_year && (
                <div>
                  <p className="opacity-60 pb-1">Graduation Year</p>
                  <p>{user.graduation_year}</p>
                </div>
              )}
              {user.instagram && (
                <div>
                  <p className="opacity-60 pb-1">Instagram</p>
                  <Link to={'https://www.instagram.com/' + user.instagram} target="_blank">
                    @{user.instagram}
                  </Link>
                </div>
              )}
            </div>
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

          {!loading && (
            <div className="fade-in flex-grow flex flex-col items-start gap-7">
              {/* Tabs */}
              <div className="flex flex-row gap-3 font-serif text-xl">
                {model && (
                  <Link
                    className={'button sm border ' + (tab !== 'model' && 'transparent')}
                    to={`/profile/${email}/model`}
                  >
                    Model Profile
                  </Link>
                )}
                {photographer && (
                  <Link
                    className={'button sm border ' + (tab !== 'photographer' && 'transparent')}
                    to={`/profile/${email}/photographer`}
                  >
                    Photographer Profile
                  </Link>
                )}
              </div>

              {/* Model page */}
              {model && tab === 'model' && (
                <>
                  {(model.gender || model.race || model.height) && (
                    <div className="flex flex-col gap-3">
                      <p className="font-bold">Model Information</p>
                      {model.gender && (
                        <div className="flex flex-row gap-5">
                          <p className="w-32 opacity-60">Gender</p>
                          <p className="">{model.gender}</p>
                        </div>
                      )}
                      {model.race && (
                        <div className="flex flex-row gap-5">
                          <p className="w-32 opacity-60">Race</p>
                          <p className="">{model.race?.join(', ')}</p>
                        </div>
                      )}
                      {model.height && (
                        <div className="flex flex-row gap-5">
                          <p className="w-32 opacity-60">Height</p>
                          <p className="w-40">{model.height}"</p>
                        </div>
                      )}
                    </div>
                  )}
                  {model.photos && model.photos.length > 0 && (
                    <>
                      <div
                        className="w-full grid gap-5"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
                      >
                        {model.photos.map((photo) => (
                          <div
                            className="w-full rounded bg-cover bg-no-repeat bg-center"
                            style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                            key={photo}
                          ></div>
                        ))}
                      </div>
                    </>
                  )}
                  {!model.gender && !model.race && !model.height && !model.photos && (
                    <p className="skew-x-[-10deg] opacity-60">No information.</p>
                  )}
                </>
              )}

              {/* Photographer page */}
              {photographer &&
                tab === 'photographer' &&
                (photographer.photos && photographer.photos.length > 0 ? (
                  <>
                    <p className="font-bold">Portfolio</p>
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
                ) : (
                  <p className="skew-x-[-10deg] opacity-60">No information.</p>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
