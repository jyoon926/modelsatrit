import { Link } from 'react-router-dom';
import { Comment as IComment, Like } from '../utils/Types';
import { getRelativeTime } from '../utils/RenderUtils';
import ProfilePhoto from './ProfilePhoto';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/Supabase';
import { useAuth } from '../utils/AuthContext';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import Modal from './Modal';
import Likes from './Likes';
import OptionsMenu from './OptionsMenu';
import { MdDeleteOutline } from 'react-icons/md';
import LoginModal from './LoginModal';

interface Props {
  comment: IComment;
  onDelete: (comment_id: number) => void;
}

export default function Comment({ comment, onDelete }: Props) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Like[]>([]);
  const [liked, setLiked] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from('like')
      .select('*, user:user(*, profile_photo:photo(*))')
      .eq('comment_id', comment.id);
    if (!error) {
      setLikes(data);
      setLiked(data.find((like) => like.user_id === user?.id));
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  const handleLike = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (liked) {
      const { error } = await supabase.from('like').delete().eq('user_id', user?.id).eq('comment_id', comment.id);
      if (!error) {
        fetchLikes();
      }
    } else {
      const { error } = await supabase.from('like').insert([{ comment_id: comment.id, user_id: user?.id }]);
      if (!error) {
        fetchLikes();
      }
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('comment').delete().eq('id', comment.id);
    if (!error) {
      onDelete(comment.id);
    }
  };

  return (
    <div
      className="w-full flex flex-row justify-start items-start gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={
          'mt-[7px] mr-[-0.7rem] ml-[-0.35rem] duration-300 ' +
          (user?.id === comment?.user_id
            ? isHovered || isOptionsOpen
              ? 'sm:opacity-100 sm:pointer-events-auto'
              : 'sm:opacity-0 sm:pointer-events-none'
            : 'opacity-0 pointer-events-none')
        }
      >
        <OptionsMenu onClose={() => setIsOptionsOpen(false)} onOpen={() => setIsOptionsOpen(true)}>
          {comment.user_id === user?.id && (
            <button className="button transparent sm flex flex-row items-center gap-1" onClick={handleDelete}>
              <MdDeleteOutline className="text-xl" /> Delete comment
            </button>
          )}
        </OptionsMenu>
      </div>
      <ProfilePhoto user={comment.user} />
      <div className="w-full">
        <p className="w-full leading-snug break-words whitespace-pre-line">
          <Link className="font-bold mr-1" to={'/profile/' + comment.user.email}>
            {comment.user.name}
          </Link>{' '}
          {comment.content}
        </p>
        <span className="opacity-60 text-xs mt-1">{getRelativeTime(comment.created_at)}</span>
      </div>
      <div className="flex flex-row items-center gap-1 text-red-500 text-xs mt-[9px]">
        <button onClick={() => setIsModalOpen(true)}>{likes.length > 0 && likes.length}</button>
        <button onClick={handleLike}>
          {liked ? <IoMdHeart className="text-xl" /> : <IoMdHeartEmpty className="text-xl" />}
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Likes">
        <Likes likes={likes} />
      </Modal>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
