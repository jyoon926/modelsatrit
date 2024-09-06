import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Model, Photographer, Post, User } from '../utils/Types';
import { supabase } from '../supabase';
import { useAuth } from '../utils/AuthContext';
import ProfilePhoto from '../components/ProfilePhoto';
import { Sizes } from '../utils/Enums';
import Slideshow from '../components/Slideshow';
import PostCard from '../components/PostCard';

export default function PublicProfile() {
  // Auth
  const { user: authUser, logout } = useAuth();

  // URL Params
  const { email } = useParams();
  const { tab } = useParams();

  // Supabase Data
  const [user, setUser] = useState<User>();
  const [model, setModel] = useState<Model>();
  const [photographer, setPhotographer] = useState<Photographer>();
  const [posts, setPosts] = useState<Post[]>();

  // Misc
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState(tab);
  const [tabs, setTabs] = useState<string[]>([]);
  const navigate = useNavigate();

  // Slideshow
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowPhotos, setSlideshowPhotos] = useState(['']);
  const [slideshowId, setSlideshowId] = useState(0);

  const getModel = async (user_id: number) => {
    const { data, error } = await supabase
      .from('model')
      .select('*, photos:model_photo(photo(*))')
      .eq('user_id', user_id)
      .single();
    if (!error) {
      setModel({ ...data, photos: data.photos.map((item: any) => item.photo) });
      setTabs((prev) => [...prev, 'model']);
    }
  };

  const getPhotographer = async (user_id: number) => {
    const { data, error } = await supabase
      .from('photographer')
      .select('*, photos:photographer_photo(photo(*))')
      .eq('user_id', user_id)
      .single();
    if (!error) {
      setPhotographer({ ...data, photos: data.photos.map((item: any) => item.photo) });
      setTabs((prev) => [...prev, 'photographer']);
    }
  };

  const getPosts = async (user_id: number) => {
    const { data, error } = await supabase
      .from('post')
      .select('*, user:user(*, profile_photo:photo(*)), photos:post_photo(photo(*))')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (!error && data.length > 0) {
      const reshapedData = data.map((post) => ({ ...post, photos: post.photos.map((item: any) => item.photo) }));
      setPosts(reshapedData);
      setTabs((prev) => [...prev, 'posts']);
    }
  };

  const fetchUser = async () => {
    if (email) {
      setTabs([]);
      setLoading(true);
      const { data, error } = await supabase
        .from('user')
        .select('*, profile_photo:photo(*)')
        .eq('email', email)
        .single();
      if (!error) {
        setUser(data);
        await getModel(data.id);
        await getPhotographer(data.id);
        await getPosts(data.id);
      } else {
        return navigate('/404');
      }
      setLoading(false);
    }
  };

  const checkTab = () => {
    if (tabs.length === 0) {
      return navigate(`/profile/${email}`);
    }

    if (!tab) {
      return navigate(`/profile/${email}/${tabs[0]}`);
    }

    if (!['model', 'photographer', 'posts'].includes(tab)) {
      if (model) return navigate(`/profile/${email}/model`);
      if (photographer) return navigate(`/profile/${email}/photographer`);
      return navigate(`/profile/${email}`);
    }

    if ((tab === 'model' && !model) || (tab === 'photographer' && !photographer) || (tab === 'posts' && !posts)) {
      return navigate(`/profile/${email}/${tabs[0]}`);
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

  const handleDeletePost = (post_id: number) => {
    setPosts((prevPosts) => prevPosts!.filter((post) => post.id !== post_id));
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
          <div className="w-full max-w-[300px] flex flex-col gap-5">
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
                  <Link to={'https://www.instagram.com/' + user.instagram.replace('@', '')} target="_blank">
                    {user.instagram}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {!loading && tabs.length > 0 && (
            <div className="w-full sm:w-auto fade-in grow flex flex-col">
              {/* Tabs */}
              <div className="flex flex-row font-serif text-xl mb-5 border-b-[1px]">
                {tabs.includes('model') && (
                  <button
                    className={
                      'sm px-4 sm:px-5 py-1.5 sm:py-2 z-10 mb-[-1px] border-b-[1px] border-foreground ' +
                      (currentTab !== 'model' && 'opacity-60 border-transparent')
                    }
                    onClick={() => handleTabClick('model')}
                  >
                    Modeling
                  </button>
                )}
                {tabs.includes('photographer') && (
                  <button
                    className={
                      'sm px-4 sm:px-5 py-1.5 sm:py-2 z-10 mb-[-1px] border-b-[1px] border-foreground ' +
                      (currentTab !== 'photographer' && 'opacity-60 border-transparent')
                    }
                    onClick={() => handleTabClick('photographer')}
                  >
                    Photography
                  </button>
                )}
                {tabs.includes('posts') && (
                  <button
                    className={
                      'sm px-4 sm:px-5 py-1.5 sm:py-2 z-10 mb-[-1px] border-b-[1px] border-foreground ' +
                      (currentTab !== 'posts' && 'opacity-60 border-transparent')
                    }
                    onClick={() => handleTabClick('posts')}
                  >
                    Posts
                  </button>
                )}
              </div>

              <div className="w-full flex flex-col items-start justify-start gap-5">
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
                    {model.photos.length > 0 && (
                      <>
                        <p className="font-bold">Portfolio</p>
                        <div className="w-full flex flex-row flex-wrap gap-5 sm:gap-3">
                          {model.photos.map((photo, index) => (
                            <img
                              className="w-full sm:w-auto sm:h-72 rounded-md cursor-pointer"
                              src={photo.medium}
                              key={index}
                              onClick={() =>
                                handlePhotoClick(
                                  index,
                                  model.photos.map((photo) => photo.large)
                                )
                              }
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
                  (photographer.photos.length > 0 ? (
                    <>
                      <p className="font-bold">Portfolio</p>
                      <div className="w-full flex flex-row flex-wrap gap-5 sm:gap-3">
                        {photographer.photos.map((photo, index) => (
                          <img
                            className="w-full sm:w-auto sm:h-72 rounded-md cursor-pointer"
                            src={photo.medium}
                            key={index}
                            onClick={() =>
                              handlePhotoClick(
                                index,
                                photographer.photos.map((photo) => photo.large)
                              )
                            }
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="skew-x-[-10deg] opacity-60">No information.</p>
                  ))}

                {/* Posts page */}
                {posts && currentTab === 'posts' && (
                  <>
                    {posts && posts.length > 0 ? (
                      posts?.map((post, index) => (
                        <div className="w-full max-w-[800px] flex flex-col gap-5" key={index}>
                          <PostCard post={post} onDelete={handleDeletePost}></PostCard>
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
