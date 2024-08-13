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
  const [currentTab, setCurrentTab] = useState(tab);

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

  const handleTabClick = (selectedTab: string) => {
    var newurl = window.location.protocol + '//' + window.location.host + `/profile/${email}/${selectedTab}`;
    window.history.pushState({ path: newurl }, '', newurl);
    setCurrentTab(selectedTab);
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
        <div className="flex flex-col sm:flex-row sm:items-end border-b w-full mb-10 gap-5">
          <div className="mb-2">
            <ProfilePhoto user={user} size={Sizes.xl} />
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif">{user.display_name}</h1>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-7">
          {/* Basic info panel */}
          <div className="w-[250px] flex flex-col gap-5">
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
            <div className="w-full py-5 px-3 sm:px-5 border rounded flex flex-col items-start gap-5 leading-snug">
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
          </div>

          {!loading && (
            <div className="w-full sm:w-auto fade-in grow flex flex-col">
              {/* Tabs */}
              <div className="flex flex-row font-serif text-[1.1rem] sm:text-xl mb-[-1px]">
                {model && (
                  <button
                    className={
                      'sm border border-b-0 rounded rounded-b-none px-3 sm:px-5 py-2.5 bg-background z-10 ' +
                      (currentTab !== 'model' && 'opacity-50 border-transparent bg-transparent')
                    }
                    onClick={() => handleTabClick('model')}
                  >
                    Model Profile
                  </button>
                )}
                {photographer && (
                  <button
                    className={
                      'sm border border-b-0 rounded rounded-b-none px-3 py-3 bg-background z-10 ' +
                      (currentTab !== 'photographer' && 'opacity-50 border-transparent bg-transparent')
                    }
                    onClick={() => handleTabClick('photographer')}
                  >
                    Photographer Profile
                  </button>
                )}
              </div>

              <div
                className={`flex flex-col items-start justify-start gap-5 py-5 px-3 sm:px-5 border rounded ${currentTab === 'model' && 'rounded-tl-none'}`}
              >
                {/* Model page */}
                {model && currentTab === 'model' && (
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
                          className="w-full flex flex-wrap sm:grid gap-3 sm:gap-5"
                          style={{
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                          }}
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
                  currentTab === 'photographer' &&
                  (photographer.photos && photographer.photos.length > 0 ? (
                    <>
                      <p className="font-bold">Portfolio</p>
                      <div
                        className="w-full flex flex-wrap sm:grid gap-3 sm:gap-5"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
                      >
                        {photographer.photos.map((photo) => (
                          <div
                            className="w-full rounded bg-cover bg-no-repeat bg-center"
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
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
