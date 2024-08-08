import { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import ProfilePhoto from '../components/ProfilePhoto';
import { MdOutlineFileUpload } from 'react-icons/md';
import Compressor from 'compressorjs';
import { Sizes } from '../utils/Enums';

export default function Profile() {
  const { user, logout, update } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<File>();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.display_name);
      user.bio && setBio(user.bio);
      user.graduation_year && setGradYear(user.graduation_year);
      user.instagram && setInstagram(user.instagram);
    }
  }, [user]);

  const saveChanges = async () => {
    const { error } = await supabase
      .from('users')
      .update({ bio, graduation_year: gradYear, instagram })
      .eq('user_id', user!.user_id);
    if (!error) update();
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

  const handleProfilePhotoUpload = async () => {
    if (!user || !profilePhoto) return;
    const uploadedImageUrl: string = await compressAndUploadImage(profilePhoto);
    const { error } = await supabase
      .from('users')
      .update([{ profile_photo: uploadedImageUrl }])
      .eq('user_id', user!.user_id);
    if (!error) {
      setProfilePhoto(undefined);
      update();
    }
  };

  return (
    user && (
      <div className="fade-in">
        <div className="w-full px-5 py-32 flex flex-col justify-start items-start">
          <div className="flex flex-row items-end border-b w-full mb-10 gap-5">
            <div className="mb-2">
              <ProfilePhoto user={user} isLink={false} size={Sizes.xl} />
            </div>
            <h1 className="text-7xl font-serif">{user.display_name}</h1>
          </div>
          <div className="w-full flex flex-col items-start gap-10">
            <div className="w-full flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="opacity-60" htmlFor="profile-photo">
                  {user.profile_photo ? 'Set a new profile photo' : 'Upload a profile photo'}
                </label>
                <input
                  className="max-w-64 cursor-pointer"
                  type="file"
                  id="profile-photo"
                  accept=".jpeg, .jpg, .png, .gif"
                  onChange={(e) => setProfilePhoto(e.target.files?.[0])}
                />
                {profilePhoto && (
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex flex-row items-center gap-3">
                      <p className="opacity-60">Preview:</p>
                      <img className="w-14 h-14 rounded-full" src={URL.createObjectURL(profilePhoto)} alt="" />
                    </div>
                    <button
                      className="button sm light flex flex-row items-center gap-1"
                      onClick={handleProfilePhotoUpload}
                    >
                      <MdOutlineFileUpload className="text-xl" /> Upload
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full flex flex-col gap-2">
                <label className="opacity-60" htmlFor="name">
                  Name
                </label>
                <input
                  className="w-full max-w-64"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="opacity-60" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  className="w-full max-w-96 h-24 overflow-y-auto"
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="opacity-60" htmlFor="grad-year">
                  Graduation Year
                </label>
                <input
                  className="w-full max-w-64"
                  id="grad-year"
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="opacity-60" htmlFor="instagram">
                  Instagram
                </label>
                <input
                  className="w-full max-w-64"
                  id="instagram"
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>
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
        </div>
      </div>
    )
  );
}
