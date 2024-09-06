import { Link } from 'react-router-dom';
import { User } from '../utils/Types';
import { getInitials } from '../utils/RenderUtils';
import { Sizes } from '../utils/Enums';

interface Props {
  user: User;
  size?: Sizes;
  isLink?: boolean;
}

export default function ({ user, size = Sizes.md, isLink = true }: Props) {
  const ProfileElement = user.profile_photo ? (
    <div className={'profile-picture ' + size} style={{ backgroundImage: `url('${user.profile_photo.small}')` }} />
  ) : (
    <div className={'profile-picture bg-stone-300 text-foreground ' + size}>{getInitials(user.name)}</div>
  );

  return <>{isLink ? <Link to={'/profile/' + user.email}>{ProfileElement}</Link> : ProfileElement}</>;
}
