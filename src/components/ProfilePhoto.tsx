import { Link } from 'react-router-dom';
import { Photo, User } from '../utils/Types';
import { getInitials } from '../utils/RenderUtils';
import { Sizes } from '../utils/Enums';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Props {
  user: User;
  size?: Sizes;
  isLink?: boolean;
}

export default function ({ user, size, isLink = true }: Props) {
  const [profilePhoto, setProfilePhoto] = useState<Photo>();

  useEffect(() => {
    const fetchPhoto = async () => {
      if (user.profile_photo) {
        const { data, error } = await supabase.from('photo').select('*').eq('id', user.profile_photo).single();
        if (!error) {
          setProfilePhoto(data);
        }
      }
    };

    fetchPhoto();
  }, [user]);

  const ProfileElement = profilePhoto ? (
    <div className={'profile-picture ' + size} style={{ backgroundImage: `url('${profilePhoto.small}')` }} />
  ) : (
    <div className={'profile-picture bg-stone-300 ' + size}>{getInitials(user.name)}</div>
  );

  return <>{isLink ? <Link to={'/profile/' + user.email}>{ProfileElement}</Link> : ProfileElement}</>;
}
