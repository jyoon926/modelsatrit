import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Model, Photographer, Post, User } from '../utils/Types';
import { supabase } from '../supabase';
import { useAuth } from '../utils/AuthContext';
import ProfilePhoto from '../components/ProfilePhoto';
import { Sizes } from '../utils/Enums';
import Slideshow from '../components/Slideshow';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { email } = useParams();
  const { tab } = useParams();
  const [user, setUser] = useState<User>();
  const [model, setModel] = useState<Model>();
  const [photographer, setPhotographer] = useState<Photographer>();
  const [posts, setPosts] = useState<Post[]>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(tab);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowPhotos, setSlideshowPhotos] = useState(['']);
  const [slideshowId, setSlideshowId] = useState(0);

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

  const getPosts = async (user_id: number) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(*), likes:likes(*)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (!error) {
      setPosts(data);
    }
  };

  const fetchUser = async () => {
    if (email) {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (!error) {
        setUser(data);
        await getModel(data.user_id);
        await getPhotographer(data.user_id);
        await getPosts(data.user_id);
      } else {
        return navigate('/404');
      }
      setLoading(false);
    }
  };

  const checkTab = () => {
    if (!tab) {
      if (model) return navigate(`/profile/${email}/model`);
      else if (photographer) return navigate(`/profile/${email}/photographer`);
    }

    if (tab === 'model' && !model) {
      return navigate(`/profile/${email}${photographer ? '/photographer' : ''}`);
    }

    if (tab === 'photographer' && !photographer) {
      return navigate(`/profile/${email}${model ? '/model' : ''}`);
    }

    if (tab && !['model', 'photographer', 'posts'].includes(tab)) {
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
    setCurrentTab(tab);
  }, [tab]);

  useEffect(() => {
    fetchUser();
  }, [email]);

  useEffect(() => {
    if (loading) return;
    checkTab();
  }, [loading]);

  const handlePhotoClick = (id: number, photos: string[]) => {
    setSlideshowPhotos(photos);
    setIsSlideshowOpen(true);
    setSlideshowId(id);
  };

  return user ? (
    <div className="fade-in">
      <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
        {/* Name */}
        <div className="flex flex-col sm:flex-row sm:items-end border-b w-full mb-10 gap-5">
          <div className="mb-2">
            <ProfilePhoto user={user} size={Sizes.xl} />
          </div>
          <h1 className="text-7xl font-serif">{user.name}</h1>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-5">
          {/* Basic info panel */}
          <div className="w-[300px] flex flex-col gap-5">
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
            <div className="w-full p-5 border rounded-lg flex flex-col items-start gap-5 leading-snug">
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
              {user.major && (
                <div>
                  <p className="opacity-60 pb-1">Major</p>
                  <p>{user.major}</p>
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
              <div className="flex flex-row font-serif text-xl mb-[-1px]">
                {model && (
                  <button
                    className={
                      'sm border border-b-0 rounded-lg rounded-b-none px-3 sm:px-5 py-2.5 bg-background z-10 ' +
                      (currentTab !== 'model' && 'opacity-60 border-transparent bg-transparent')
                    }
                    onClick={() => handleTabClick('model')}
                  >
                    Model Profile
                  </button>
                )}
                {photographer && (
                  <button
                    className={
                      'sm border border-b-0 rounded-lg rounded-b-none px-3 py-3 bg-background z-10 ' +
                      (currentTab !== 'photographer' && 'opacity-60 border-transparent bg-transparent')
                    }
                    onClick={() => handleTabClick('photographer')}
                  >
                    Photographer Profile
                  </button>
                )}
                <button
                  className={
                    'sm border border-b-0 rounded-lg rounded-b-none px-3 py-3 bg-background z-10 ' +
                    (currentTab !== 'posts' && 'opacity-60 border-transparent bg-transparent')
                  }
                  onClick={() => handleTabClick('posts')}
                >
                  Posts
                </button>
              </div>

              <div
                className={`flex flex-col items-start justify-start gap-5 p-5 border rounded-lg ${currentTab === 'model' && 'rounded-tl-none'}`}
              >
                {/* Model page */}
                {model && currentTab === 'model' && (
                  <>
                    {(model.gender || model.race || model.height) && (
                      <>
                        <p className="font-bold">Model Information</p>
                        <div className="flex flex-col gap-3">
                          {model.gender && (
                            <div className="flex flex-row gap-5">
                              <p className="w-32 opacity-60">Gender</p>
                              <p className="">{model.gender}</p>
                            </div>
                          )}
                          {model.race && (
                            <div className="flex flex-row gap-5">
                              <p className="w-32 opacity-60">Race</p>
                              <p className="">{model.race.join(', ')}</p>
                            </div>
                          )}
                          {model.height && (
                            <div className="flex flex-row gap-5">
                              <p className="w-32 opacity-60">Height</p>
                              <p className="w-40">{model.height}"</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {model.photos && model.photos.length > 0 && (
                      <>
                        <div
                          className="w-full flex flex-wrap sm:grid gap-3"
                          style={{
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          }}
                        >
                          {model.photos.map((photo, index) => (
                            <button
                              className="w-full rounded bg-cover bg-no-repeat bg-center"
                              style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                              key={index}
                              onClick={() => handlePhotoClick(index, model.photos)}
                            />
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
                        className="w-full flex flex-wrap sm:grid gap-3"
                        style={{
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        }}
                      >
                        {photographer.photos.map((photo, index) => (
                          <button
                            className="w-full rounded bg-cover bg-no-repeat bg-center"
                            style={{ backgroundImage: `url(${photo})`, aspectRatio: '1' }}
                            key={index}
                            onClick={() => handlePhotoClick(index, photographer.photos)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="skew-x-[-10deg] opacity-60">No information.</p>
                  ))}

                {/* Posts page */}
                {currentTab === 'posts' && (
                  <>
                    {posts && posts.length > 0 ? (
                      posts?.map((post, index) => (
                        <div className="w-full max-w-[800px] flex flex-col gap-5">
                          <PostCard post={post} onDelete={() => {}} key={index}></PostCard>
                        </div>
                      ))
                    ) : (
                      <p className="skew-x-[-10deg] opacity-60">This user has no posts.</p>
                    )}
                  </>
                )}
              </div>
              <Slideshow
                selected={slideshowId}
                photos={slideshowPhotos}
                isOpen={isSlideshowOpen}
                onClose={() => setIsSlideshowOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
