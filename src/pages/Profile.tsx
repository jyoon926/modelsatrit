import { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import ProfilePhoto from '../components/ProfilePhoto';
import { MdClose, MdOutlineAddBox, MdOutlineFileUpload } from 'react-icons/md';
import Compressor from 'compressorjs';
import { Sizes } from '../utils/Enums';
import { Model, Photographer } from '../utils/Types';
import PhotoUpload from '../components/PhotoUpload';
import { useNotification } from '../components/Notification';

export default function Profile() {
  const { user, logout, update } = useAuth();
  const { toastPromise } = useNotification();
  const [model, setModel] = useState<Model>();
  const [photographer, setPhotographer] = useState<Photographer>();
  const [profilePhoto, setProfilePhoto] = useState<File>();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [instagram, setInstagram] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [height, setHeight] = useState('');
  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    if (user) {
      getModel(user.user_id);
      getPhotographer(user.user_id);
      setName(user.display_name);
      user.bio && setBio(user.bio);
      user.graduation_year && setGradYear(user.graduation_year);
      user.instagram && setInstagram(user.instagram);
    }
  }, [user]);

  const getModel = async (user_id: number) => {
    const { data, error } = await supabase.from('models').select('*').eq('user_id', user_id).single();
    if (!error) {
      setModel(data);
      setGender(data.gender);
      setRace(data.race);
      setHeight(data.height);
    }
  };

  const getPhotographer = async (user_id: number) => {
    const { data, error } = await supabase.from('photographers').select('*').eq('user_id', user_id).single();
    if (!error) {
      setPhotographer(data);
    }
  };

  const createModelProfile = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase.from('models').insert({ user_id: user!.user_id }).select('*').single();
      if (!error) {
        setModel(data);
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Creating model profile...',
      success: 'Created model profile!',
      error: 'Failed to create model profile.',
    });
  };

  const deleteModelProfile = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      const { error } = await supabase.from('models').delete().eq('user_id', user!.user_id);
      if (!error) {
        setModel(undefined);
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Deleting model profile...',
      success: 'Deleted model profile!',
      error: 'Failed to delete model profile.',
    });
  };

  const createPhotographerProfile = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('photographers')
        .insert({ user_id: user!.user_id })
        .select('*')
        .single();
      if (!error) {
        setPhotographer(data);
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Creating photographer profile...',
      success: 'Created photographer profile!',
      error: 'Failed to create photographer profile.',
    });
  };

  const deletePhotographerProfile = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      const { error } = await supabase.from('photographers').delete().eq('user_id', user!.user_id);
      if (!error) {
        setPhotographer(undefined);
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Deleting photographer profile...',
      success: 'Deleted photographer profile!',
      error: 'Failed to delete photographer profile.',
    });
  };

  const saveChanges = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      const { error: userError } = await supabase
        .from('users')
        .update({ bio, graduation_year: gradYear, instagram })
        .eq('user_id', user!.user_id);
      let modelError = null;
      if (model) {
        const { error } = await supabase
          .from('models')
          .update({ gender, race: [race], height })
          .eq('user_id', user!.user_id);
        modelError = error;
      }
      if (!userError && !modelError) {
        update();
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Saving changes...',
      success: 'Changes saved successfully!',
      error: 'Failed to save changes.',
    });
  };

  const compressAndUploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 400,
        async success(result) {
          const fileName = `${Date.now()}_${file.name.replace("'", '')}`;
          const { error } = await supabase.storage.from('profile-photos').upload(fileName, result);
          if (error) {
            reject(error);
          } else {
            const publicUrl = supabase.storage.from('profile-photos').getPublicUrl(fileName).data.publicUrl;
            resolve(publicUrl);
          }
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const uploadProfilePhoto = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      if (!user || !profilePhoto) return;
      const uploadedImageUrl: string = await compressAndUploadImage(profilePhoto);
      const { error } = await supabase
        .from('users')
        .update([{ profile_photo: uploadedImageUrl }])
        .eq('user_id', user!.user_id);
      if (!error) {
        setProfilePhoto(undefined);
        update();
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Uploading profile photo...',
      success: 'Profile photo was uploaded successfully!',
      error: 'Failed to upload profile photo.',
    });
  };

  const uploadModelPhotos = async (photosUrls: string[]) => {
    if (!user || !model) return;
    const { data, error } = await supabase
      .from('models')
      .update([{ photos: [...(model.photos || []), ...photosUrls] }])
      .eq('model_id', model.model_id)
      .select('*')
      .single();
    if (!error) {
      setModel(data);
    }
  };

  const deleteModelPhoto = async (index: number) => {
    if (!user || !model) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('models')
        .update([{ photos: model.photos.filter((_, i) => i != index) }])
        .eq('model_id', model.model_id)
        .select('*')
        .single();
      if (!error) {
        setModel(data);
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Deleting photo...',
      success: 'Photo was deleted successfully!',
      error: 'Failed to delete photo.',
    });
  };

  const uploadPhotographerPhotos = async (photosUrls: string[]) => {
    if (!user || !photographer) return;
    const { data, error } = await supabase
      .from('photographers')
      .update([{ photos: [...(photographer.photos || []), ...photosUrls] }])
      .eq('photographer_id', photographer.photographer_id)
      .select('*')
      .single();
    if (!error) {
      setPhotographer(data);
    }
  };

  const deletePhotographerPhoto = async (index: number) => {
    if (!user || !photographer) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('photographers')
        .update([{ photos: photographer.photos.filter((_, i) => i != index) }])
        .eq('photographer_id', photographer.photographer_id)
        .select('*')
        .single();
      if (!error) {
        setPhotographer(data);
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Deleting photo...',
      success: 'Photo was deleted successfully!',
      error: 'Failed to delete photo.',
    });
  };

  return (
    user && (
      <div className="fade-in">
        <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
          {/* Name */}
          <div className="flex flex-row items-end border-b w-full mb-10 gap-5">
            <div className="mb-2">
              <ProfilePhoto user={user} isLink={false} size={Sizes.xl} />
            </div>
            <h1 className="text-7xl font-serif">{user.display_name}</h1>
          </div>
          {/* Row */}
          <div className="w-full flex flex-row justify-start items-start gap-7">
            {/* Basic Information */}
            <div className="w-[300px] flex flex-col items-start gap-5">
              <div className="w-full flex flex-col gap-5 border p-5 rounded">
                <p className="font-serif text-2xl">Basic Information</p>
                {/* Email */}
                <div className="w-full flex flex-col gap-2">
                  <p className="opacity-60">Email</p>
                  <p>{user.email}</p>
                </div>
                {/* Set profile photo */}
                <div className="flex flex-col gap-2">
                  <label className="opacity-60" htmlFor="profile-photo">
                    {user.profile_photo ? 'Set a new profile photo' : 'Upload a profile photo'}
                  </label>
                  <input
                    className="cursor-pointer"
                    type="file"
                    id="profile-photo"
                    accept=".jpeg, .jpg, .png, .gif"
                    onChange={(e) => setProfilePhoto(e.target.files?.[0])}
                  />
                  {profilePhoto && (
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex flex-row items-center gap-3">
                        <p className="opacity-60">Preview:</p>
                        <div
                          className="profile-picture lg"
                          style={{ backgroundImage: `url(${URL.createObjectURL(profilePhoto)})` }}
                        />
                      </div>
                      <button className="button sm light flex flex-row items-center gap-1" onClick={uploadProfilePhoto}>
                        <MdOutlineFileUpload className="text-xl" /> Upload
                      </button>
                    </div>
                  )}
                </div>
                {/* Name */}
                <div className="w-full flex flex-col gap-2">
                  <label className="opacity-60" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="w-full"
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {/* Bio */}
                <div className="flex flex-col gap-2">
                  <label className="opacity-60" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    className="w-full h-24 overflow-y-auto"
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                {/* Graduation year */}
                <div className="flex flex-col gap-2">
                  <label className="opacity-60" htmlFor="grad-year">
                    Graduation Year
                  </label>
                  <input
                    className="w-full"
                    id="grad-year"
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                </div>
                {/* Instagram */}
                <div className="flex flex-col gap-2">
                  <label className="opacity-60" htmlFor="instagram">
                    Instagram
                  </label>
                  <input
                    className="w-full"
                    id="instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>
              {/* Buttons */}
              <button className="button" onClick={saveChanges}>
                Save Changes
              </button>
              <div className="flex flex-row gap-3">
                <Link className="button light" to={'/profile/' + user.email}>
                  View Public Profile
                </Link>
                <button className="button light" onClick={logout}>
                  Log out
                </button>
              </div>
            </div>

            <div className="flex-grow flex flex-col gap-5 items-start">
              {/* Tabs */}
              <div className="flex flex-row gap-3 font-serif text-xl">
                <button className={'button sm border ' + (tab !== 0 && 'transparent')} onClick={() => setTab(0)}>
                  Model Profile
                </button>
                <button className={'button sm border ' + (tab !== 1 && 'transparent')} onClick={() => setTab(1)}>
                  Photographer Profile
                </button>
              </div>

              {/* Model page */}
              {tab === 0 &&
                (model ? (
                  <>
                    <p className="font-bold">Model Information</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-5">
                        <label htmlFor="gender" className="w-32 opacity-60">
                          Gender
                        </label>
                        <input
                          id="gender"
                          type="text"
                          onChange={(e) => setGender(e.target.value)}
                          value={gender || ''}
                        />
                      </div>
                      <div className="flex flex-row items-center gap-5">
                        <label htmlFor="race" className="w-32 opacity-60">
                          Race
                        </label>
                        <input id="race" type="text" onChange={(e) => setRace(e.target.value)} value={race || ''} />
                      </div>
                      <div className="flex flex-row items-center gap-5">
                        <label htmlFor="height" className="w-32 opacity-60">
                          Height
                        </label>
                        <input
                          id="height"
                          type="number"
                          onChange={(e) => setHeight(e.target.value)}
                          value={height || ''}
                        />
                      </div>
                    </div>
                    <p className="font-bold">Digitals</p>
                    {model.photos && (
                      <div
                        className="w-full grid gap-5"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
                      >
                        {model.photos.map((photo, index) => (
                          <div
                            className="w-full rounded bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                            key={photo}
                          >
                            <button
                              className="absolute top-0 right-0 m-2 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                              onClick={() => deleteModelPhoto(index)}
                            >
                              <MdClose />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <PhotoUpload onUpload={uploadModelPhotos} />
                    <button className="button light flex flex-row items-center gap-1" onClick={deleteModelProfile}>
                      Delete model profile
                    </button>
                  </>
                ) : (
                  <button className="button light flex flex-row items-center gap-1" onClick={createModelProfile}>
                    <MdOutlineAddBox className="text-xl" />
                    Create model profile
                  </button>
                ))}

              {/* Photographer page */}
              {tab === 1 &&
                (photographer ? (
                  <>
                    <p className="font-bold mt-5">Photos</p>
                    {photographer.photos && (
                      <div
                        className="w-full grid gap-5"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
                      >
                        {photographer.photos.map((photo, index) => (
                          <div
                            className="w-full rounded bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${photo})`, aspectRatio: '0.75' }}
                            key={photo}
                          >
                            <button
                              className="absolute top-0 right-0 m-2 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                              onClick={() => deletePhotographerPhoto(index)}
                            >
                              <MdClose />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <PhotoUpload onUpload={uploadPhotographerPhotos} />
                    <button
                      className="button light flex flex-row items-center gap-1"
                      onClick={deletePhotographerProfile}
                    >
                      Delete photographer profile
                    </button>
                  </>
                ) : (
                  <button className="button light flex flex-row items-center gap-1" onClick={createPhotographerProfile}>
                    <MdOutlineAddBox className="text-xl" />
                    Create photographer profile
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
