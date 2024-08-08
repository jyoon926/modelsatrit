import { Link } from 'react-router-dom';
import { Like } from '../utils/Types';
import ProfilePhoto from './ProfilePhoto';

interface Props {
  likes: Like[];
}

export default function Likes({ likes }: Props) {
  return (
    <div className="flex flex-col gap-3 w-64">
      {likes.map((like) => (
        <div className="flex flex-row gap-3 items-center" key={like.like_id}>
          <ProfilePhoto user={like.user} />
          <Link to={'/profile/' + like.user.email}>{like.user.display_name}</Link>
        </div>
      ))}
    </div>
  );
}
