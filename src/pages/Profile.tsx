/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
import { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/Supabase';
import ProfilePhoto from '../components/ProfilePhoto';
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdAddCircleOutline,
  MdOutlineDelete,
  MdOutlineFileUpload,
} from 'react-icons/md';
import { Genders, Races, Sizes } from '../utils/Enums';
import { Model, Photo, Photographer } from '../utils/Types';
import PhotoUpload from '../components/PhotoUpload';
import { useNotification } from '../components/Notification';
import { deletePhoto, uploadPhoto } from '../utils/PhotoUtils';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function Profile() {
  const { user, logout, update } = useAuth();
  const { toastPromise } = useNotification();
  const [model, setModel] = useState<Model>();
  const [photographer, setPhotographer] = useState<Photographer>();
  const [profilePhoto, setProfilePhoto] = useState<File>();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [instagram, setInstagram] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState(['']);
  const [height, setHeight] = useState('');
  const [tab, setTab] = useState<number>(0);

  useDocumentTitle('Profile — Models @ RIT');

  useEffect(() => {
    if (user) {
      getModel(user.id);
      getPhotographer(user.id);
      setName(user.name);
      user.bio && setBio(user.bio);
      user.graduation_year && setGradYear(user.graduation_year);
      user.major && setMajor(user.major);
      user.instagram && setInstagram(user.instagram);
    }
  }, [user]);

  const getModel = async (user_id: number) => {
    const { data, error } = await supabase
      .from('model')
      .select('*, photos:model_photo(photo(*))')
      .eq('user_id', user_id)
      .single();
    if (!error) {
      setModel({ ...data, photos: data.photos.map((item: any) => item.photo) });
      setGender(data.gender);
      setRace(data.race);
      setHeight(data.height);
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
    }
  };

  const createModelProfile = async () => {
    if (!user) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase.from('model').insert({ user_id: user.id }).select('*').single();
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
    if (!model) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      model.photos.map(async (photo) => {
        await deletePhoto(photo);
      });
      const { error } = await supabase.from('model').delete().eq('id', model.id);
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
    if (!user) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase.from('photographer').insert({ user_id: user.id }).select('*').single();
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
    if (!photographer) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      photographer.photos.map(async (photo) => {
        await deletePhoto(photo);
      });
      const { error } = await supabase.from('photographer').delete().eq('id', photographer.id);
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
    if (!user) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const userUpdate: any = {};
      if (name) userUpdate.name = name;
      if (bio) userUpdate.bio = bio;
      if (major) userUpdate.major = major;
      if (gradYear) userUpdate.graduation_year = parseInt(gradYear);
      if (instagram) userUpdate.instagram = instagram;
      const { error: userError } = await supabase.from('user').update(userUpdate).eq('id', user.id);
      let modelError = null;
      const modelUpdate: any = {};
      if (gender) modelUpdate.gender = gender;
      if (race) modelUpdate.race = race;
      if (height) modelUpdate.height = height;
      if (model) {
        const { error } = await supabase.from('model').update(modelUpdate).eq('id', model.id);
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

  const uploadProfilePhoto = async () => {
    const promise = new Promise<void>(async (resolve, reject) => {
      if (!user || !profilePhoto) return;
      const photo = await uploadPhoto(profilePhoto);
      const { error } = await supabase
        .from('user')
        .update([{ profile_photo: photo.id }])
        .eq('id', user.id);
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

  const uploadModelPhotos = async (photos: Photo[]) => {
    if (!user || !model) return;
    await supabase.from('model_photo').insert(
      photos.map((photo) => {
        return { model_id: model.id, photo_id: photo.id };
      })
    );
    const { error } = await supabase
      .from('model')
      .update([{ photos: [...model.photos.map((photo) => photo.id), ...photos.map((photo) => photo.id)] }])
      .eq('id', model.id);
    if (!error) {
      setModel({ ...model, photos: [...model.photos, ...photos] });
    }
  };

  const deleteModelPhoto = async (index: number) => {
    if (!user || !model) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      await deletePhoto(model.photos[index]);
      const { error } = await supabase
        .from('model')
        .update([{ photos: model.photos.filter((_, i) => i != index).map((photo) => photo.id) }])
        .eq('id', model.id);
      if (!error) {
        setModel({ ...model, photos: model.photos.filter((_, i) => i != index) });
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

  const uploadPhotographerPhotos = async (photos: Photo[]) => {
    if (!user || !photographer) return;
    await supabase.from('photographer_photo').insert(
      photos.map((photo) => {
        return { photographer_id: photographer.id, photo_id: photo.id };
      })
    );
    const { error } = await supabase
      .from('photographer')
      .update([{ photos: [...photographer.photos.map((photo) => photo.id), ...photos.map((photo) => photo.id)] }])
      .eq('id', photographer.id);
    if (!error) {
      setPhotographer({ ...photographer, photos: [...photographer.photos, ...photos] });
    }
  };

  const deletePhotographerPhoto = async (index: number) => {
    if (!user || !photographer) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const photo = photographer.photos[index];
      await deletePhoto(photo);
      const { error } = await supabase
        .from('photographer')
        .update([{ photos: photographer.photos.filter((_, i) => i != index).map((photo) => photo.id) }])
        .eq('id', photographer.id);
      if (!error) {
        setPhotographer({ ...photographer, photos: photographer.photos.filter((_, i) => i != index) });
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

  const handleSetRace = (e: HTMLSelectElement) => {
    const values = Array.from(e.selectedOptions, (option) => option.value);
    setRace(values);
  };

  const moveModelPhotoLeft = async (index: number) => {
    if (!user || !model) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const updatedPhotos = [...model.photos];
      [updatedPhotos[index - 1], updatedPhotos[index]] = [updatedPhotos[index], updatedPhotos[index - 1]];
      const { error } = await supabase
        .from('model')
        .update([{ photos: updatedPhotos.map((photo) => photo.id) }])
        .eq('id', model.id);
      if (!error) {
        setModel({ ...model, photos: updatedPhotos });
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Moving photo...',
      success: 'Photo was moved successfully!',
      error: 'Failed to move photo.',
    });
  };

  const moveModelPhotoRight = async (index: number) => {
    if (!user || !model) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const updatedPhotos = [...model.photos];
      [updatedPhotos[index + 1], updatedPhotos[index]] = [updatedPhotos[index], updatedPhotos[index + 1]];
      const { error } = await supabase
        .from('model')
        .update([{ photos: updatedPhotos.map((photo) => photo.id) }])
        .eq('id', model.id);
      if (!error) {
        setModel({ ...model, photos: updatedPhotos });
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Moving photo...',
      success: 'Photo was moved successfully!',
      error: 'Failed to move photo.',
    });
  };

  const movePhotographerPhotoLeft = async (index: number) => {
    if (!user || !photographer) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const updatedPhotos = [...photographer.photos];
      [updatedPhotos[index - 1], updatedPhotos[index]] = [updatedPhotos[index], updatedPhotos[index - 1]];
      const { error } = await supabase
        .from('photographer')
        .update([{ photos: updatedPhotos.map((photo) => photo.id) }])
        .eq('id', photographer.id);
      if (!error) {
        setPhotographer({ ...photographer, photos: updatedPhotos });
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Moving photo...',
      success: 'Photo was moved successfully!',
      error: 'Failed to move photo.',
    });
  };

  const movePhotographerPhotoRight = async (index: number) => {
    if (!user || !photographer) return;
    const promise = new Promise<void>(async (resolve, reject) => {
      const updatedPhotos = [...photographer.photos];
      [updatedPhotos[index + 1], updatedPhotos[index]] = [updatedPhotos[index], updatedPhotos[index + 1]];
      const { error } = await supabase
        .from('photographer')
        .update([{ photos: updatedPhotos.map((photo) => photo.id) }])
        .eq('id', photographer.id);
      if (!error) {
        setPhotographer({ ...photographer, photos: updatedPhotos });
        resolve();
      } else {
        reject();
      }
    });
    toastPromise(promise, {
      pending: 'Moving photo...',
      success: 'Photo was moved successfully!',
      error: 'Failed to move photo.',
    });
  };

  return (
    user && (
      <div className="fade-in">
        <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
          {/* Name */}
          <div className="flex flex-col sm:flex-row sm:items-end border-b w-full mb-10 gap-2 sm:gap-5">
            <div className="mb-2">
              <ProfilePhoto user={user} isLink={false} size={Sizes.xl} />
            </div>
            <h1 className="text-7xl font-serif">{user.name}</h1>
          </div>
          {/* Row */}
          <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-5">
            {/* Basic Information */}
            <div className="w-full sm:max-w-[300px] flex flex-col gap-5 items-start">
              {/* Buttons */}
              <div className="flex flex-row gap-3">
                <Link className="button light" to={'/profile/' + user.email}>
                  View Public Profile
                </Link>
                <button className="button light" onClick={logout}>
                  Log out
                </button>
              </div>
              <button className="button" onClick={saveChanges}>
                Save Changes
              </button>
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
                    className="w-full h-32 overflow-y-auto"
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                {/* Major */}
                <div className="flex flex-col gap-2">
                  <label className="opacity-60" htmlFor="major">
                    Major
                  </label>
                  <input
                    className="w-full"
                    id="major"
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
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
                    placeholder="@"
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto grow flex flex-col">
              {/* Tabs */}
              <div className="flex flex-row font-serif text-xl mb-5 border-b-[1px]">
                <button
                  className={
                    'sm px-4 sm:px-5 py-1.5 sm:py-2 z-10 mb-[-1px] border-b-[1px] border-foreground ' +
                    (tab !== 0 && 'opacity-60 border-transparent')
                  }
                  onClick={() => setTab(0)}
                >
                  Model Profile
                </button>
                <button
                  className={
                    'sm px-4 sm:px-5 py-1.5 sm:py-2 z-10 mb-[-1px] border-b-[1px] border-foreground ' +
                    (tab !== 1 && 'opacity-60 border-transparent')
                  }
                  onClick={() => setTab(1)}
                >
                  Photographer Profile
                </button>
              </div>

              <div className={`flex flex-col items-start justify-start gap-5 ${tab === 0 && 'rounded-tl-none'}`}>
                {/* Model page */}
                {tab === 0 &&
                  (model ? (
                    <>
                      <p className="font-bold">Model Information</p>
                      <div className="flex flex-col gap-5 sm:gap-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                          <label htmlFor="gender" className="w-20 opacity-60">
                            Gender
                          </label>
                          <select
                            name="gender"
                            id="gender"
                            onChange={(e) => setGender(e.target.value)}
                            value={gender || ''}
                          >
                            <option value="" />
                            {Object.values(Genders).map((gender, index) => (
                              <option value={gender} key={index}>
                                {gender}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                          <label htmlFor="race" className="w-20 opacity-60">
                            Race
                          </label>
                          <select name="race" id="race" multiple value={race} onChange={(e) => handleSetRace(e.target)}>
                            <option value="" />
                            {Object.values(Races).map((race, index) => (
                              <option value={race} key={index}>
                                {race}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                          <label htmlFor="height" className="w-20 opacity-60">
                            Height
                          </label>
                          <div className="flex flex-row gap-2">
                            <div className="height-input">
                              <input
                                type="number"
                                id="height"
                                min={0}
                                max={8}
                                step={1}
                                value={Math.floor(parseInt(height, 10) / 12)}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const n = parseInt(e.target.value);
                                    if (n >= 0 && n < 9) {
                                      const inches = parseInt(height) % 12;
                                      setHeight((n * 12 + inches).toString());
                                    }
                                  } else {
                                    const inches = parseInt(height) % 12;
                                    setHeight(inches.toString());
                                  }
                                }}
                              />
                              <div className="unit">ft</div>
                            </div>
                            <div className="height-input">
                              <input
                                type="number"
                                min={0}
                                max={11}
                                step={1}
                                value={parseInt(height, 10) % 12}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const n = parseInt(e.target.value);
                                    if (n >= 0 && n < 12) {
                                      const feet = Math.floor(parseInt(height) / 12);
                                      setHeight((feet * 12 + n).toString());
                                    }
                                  } else {
                                    const feet = Math.floor(parseInt(height) / 12);
                                    setHeight((feet * 12).toString());
                                  }
                                }}
                              />
                              <div className="unit">in</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold">Digitals</p>
                      {model.photos.length > 0 && (
                        <div className="w-full flex flex-row flex-wrap gap-3">
                          {model.photos.map((photo, index) => (
                            <div className="relative" key={index}>
                              <img
                                className="h-48 rounded bg-foreground/5"
                                style={{ aspectRatio: photo.aspect_ratio }}
                                src={photo.small}
                              />
                              <button
                                className="absolute top-0 right-0 m-2 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                                onClick={() => deleteModelPhoto(index)}
                              >
                                <MdClose />
                              </button>
                              {index !== 0 && model.photos.length > 1 && (
                                <button
                                  className="absolute bottom-0 left-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                                  onClick={() => moveModelPhotoLeft(index)}
                                >
                                  <MdChevronLeft />
                                </button>
                              )}
                              {index !== model.photos.length - 1 && (
                                <button
                                  className="absolute bottom-0 right-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                                  onClick={() => moveModelPhotoRight(index)}
                                >
                                  <MdChevronRight />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <PhotoUpload onUpload={uploadModelPhotos} />
                      <button className="button light flex flex-row items-center gap-1" onClick={deleteModelProfile}>
                        <MdOutlineDelete className="text-xl" /> Delete model profile
                      </button>
                    </>
                  ) : (
                    <button className="button light flex flex-row items-center gap-1" onClick={createModelProfile}>
                      <MdAddCircleOutline className="text-xl" />
                      Create model profile
                    </button>
                  ))}

                {/* Photographer page */}
                {tab === 1 &&
                  (photographer ? (
                    <>
                      <p className="font-bold">Photos</p>
                      {photographer.photos.length > 0 && (
                        <div className="w-full flex flex-row flex-wrap gap-3">
                          {photographer.photos.map((photo, index) => (
                            <div className="relative" key={index}>
                              <img
                                className="h-48 rounded bg-foreground/5"
                                style={{ aspectRatio: photo.aspect_ratio }}
                                src={photo.small}
                              />
                              <button
                                className="absolute top-0 right-0 m-2 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                                onClick={() => deletePhotographerPhoto(index)}
                              >
                                <MdClose />
                              </button>
                              {index !== 0 && photographer.photos.length > 1 && (
                                <button
                                  className="absolute bottom-0 left-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                                  onClick={() => movePhotographerPhotoLeft(index)}
                                >
                                  <MdChevronLeft />
                                </button>
                              )}
                              {index !== photographer.photos.length - 1 && (
                                <button
                                  className="absolute bottom-0 right-0 m-1.5 p-1 bg-foreground/80 duration-300 text-background rounded-full hover:bg-foreground"
                                  onClick={() => movePhotographerPhotoRight(index)}
                                >
                                  <MdChevronRight />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <PhotoUpload onUpload={uploadPhotographerPhotos} />
                      <button
                        className="button light flex flex-row items-center gap-1"
                        onClick={deletePhotographerProfile}
                      >
                        <MdOutlineDelete className="text-xl" /> Delete photographer profile
                      </button>
                    </>
                  ) : (
                    <button
                      className="button light flex flex-row items-center gap-1"
                      onClick={createPhotographerProfile}
                    >
                      <MdAddCircleOutline className="text-xl" />
                      Create photographer profile
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
