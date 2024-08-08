import { Link } from 'react-router-dom';
import { Comment as IComment, Like, Post } from '../utils/Types';
import { useAuth } from '../utils/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdDeleteOutline } from 'react-icons/md';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import ProfilePhoto from './ProfilePhoto';
import Comment from './Comment';
import { getRelativeTime } from '../utils/RenderUtils';
import Likes from './Likes';
import Modal from './Modal';
import OptionsMenu from './OptionsMenu';
import AutoTextArea from './AutoTextArea';
import { Sizes } from '../utils/Enums';
import Slideshow from './Slideshow';

interface Props {
  post: Post;
  onDelete: (comment_id: number) => void;
}

export default function PostCard({ post, onDelete }: Props) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<IComment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [liked, setLiked] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [slideshowId, setSlideshowId] = useState(0);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:users(*), likes:likes(*)')
      .eq('post_id', post.post_id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setComments(data);
    }
  };

  const fetchLikes = async () => {
    const { data, error } = await supabase.from('likes').select('*, user:users(*)').eq('post_id', post.post_id);
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setLikes(data);
      setLiked(data.find((like) => like.user_id === user?.user_id));
    }
  };

  useEffect(() => {
    fetchComments();
    fetchLikes();
  }, []);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: post.post_id, user_id: user?.user_id, content: commentText }])
      .select('*, user:users(*), likes:likes(*)');
    if (!error && data) {
      setCommentText('');
      setShowComments(true);
      setComments([data[0], ...comments]);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      const { error } = await supabase.from('likes').delete().eq('user_id', user?.user_id).eq('post_id', post.post_id);
      if (!error) {
        setLikes(likes.filter((like) => like.user_id !== user.user_id));
        setLiked(false);
      }
    } else {
      const { data, error } = await supabase
        .from('likes')
        .insert([{ post_id: post.post_id, user_id: user?.user_id }])
        .select('*, user:users(*)');
      if (!error && data) {
        setLikes([...likes, data[0]]);
        setLiked(true);
      }
    }
  };

  const handleDeletePost = async () => {
    const { error } = await supabase.from('posts').delete().eq('post_id', post.post_id);
    if (!error) {
      onDelete(post.post_id);
    }
  };

  const handleDeleteComment = (comment_id: number) => {
    setComments((prevComments) => prevComments.filter((comment) => comment.comment_id !== comment_id));
  };

  const handlePhotoClick = (id: number) => {
    setIsSlideshowOpen(true);
    setSlideshowId(id);
  };

  return (
    <div
      className="w-full flex flex-col justify-start items-start border rounded-xl p-5 gap-3"
      key={post.post_id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top */}
      <div className="w-full flex flex-row justify-center items-center gap-3">
        <ProfilePhoto user={post.user} size={Sizes.lg} />
        <div className="w-full">
          <Link className="font-bold" to={'/profile/' + post.user.email}>
            {post.user.display_name}
          </Link>
          <p className="text-sm opacity-60">{getRelativeTime(post.created_at)}</p>
        </div>
        <div
          className={
            'duration-300 ' +
            ((isHovered || isOptionsOpen) && user?.user_id == post?.user_id
              ? 'opacity-100 pointer-events-all'
              : 'opacity-0 pointer-events-none')
          }
        >
          <OptionsMenu onClose={() => setIsOptionsOpen(false)} onOpen={() => setIsOptionsOpen(true)}>
            {post.user_id === user?.user_id && (
              <button className="button transparent sm flex flex-row items-center gap-2" onClick={handleDeletePost}>
                <MdDeleteOutline className="text-xl" /> Delete post
              </button>
            )}
          </OptionsMenu>
        </div>
      </div>

      {/* Content */}
      <p className="w-full text-lg break-words whitespace-pre-line">{post.caption}</p>
      {post.photos.length > 0 && (
        <div className="flex flex-row w-full h-[400px] rounded-lg overflow-hidden">
          <div className="w-full flex flex-col">
            <button
              className="h-full bg-cover bg-center border border-background"
              style={{ backgroundImage: `url(${post.photos[0]})` }}
              onClick={() => handlePhotoClick(0)}
            />
            {post.photos.length > 2 && (
              <button
                className="h-full bg-cover bg-center border border-background"
                style={{ backgroundImage: `url(${post.photos[2]})` }}
                onClick={() => handlePhotoClick(2)}
              />
            )}
          </div>
          {post.photos.length > 1 && (
            <div className="w-full flex flex-col">
              <button
                className="h-full bg-cover bg-center border border-background"
                style={{ backgroundImage: `url(${post.photos[1]})` }}
                onClick={() => handlePhotoClick(1)}
              />
              {post.photos.length > 3 && (
                <button
                  className="h-full bg-cover bg-center border border-background"
                  style={{ backgroundImage: `url(${post.photos[3]})` }}
                  onClick={() => handlePhotoClick(3)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Likes */}
      <div className={'w-full flex flex-row items-center gap-3 pb-3' + ((user || comments.length > 0) && ' border-b')}>
        <button className="text-red-500" onClick={() => handleLike()}>
          {liked ? <IoMdHeart className="text-2xl" /> : <IoMdHeartEmpty className="text-2xl" />}
        </button>
        <button className="flex flex-row ml-[10px] gap-1.5" onClick={() => setIsModalOpen(true)}>
          {likes.slice(0, 10).map((like) => (
            <div className="ml-[-10px]" key={like.like_id}>
              <ProfilePhoto user={like.user} key={like.like_id} size={Sizes.sm} isLink={false} />
            </div>
          ))}
          <span className="opacity-60 text-sm">
            {likes.length > 0 && likes.length + ' like' + (likes.length > 1 ? 's' : '')}
          </span>
        </button>
      </div>

      {/* Comment input */}
      {user && (
        <form className="w-full flex flex-row justify-start items-start gap-2" onSubmit={handleCommentSubmit}>
          <ProfilePhoto user={user!} />
          <div className="w-full mt-[1px]">
            <AutoTextArea value={commentText} placeholder="Add a comment..." onChange={handleCommentChange} />
          </div>
          <button className="link font-bold mt-[8px]">Post</button>
        </form>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div className="w-full flex flex-col items-start gap-5">
          {showComments ? (
            <button className="flex flex-row items-center opacity-60 link" onClick={() => setShowComments(false)}>
              Hide comments <MdKeyboardArrowUp className="text-xl" />
            </button>
          ) : (
            <button className="flex flex-row items-center opacity-60 link" onClick={() => setShowComments(true)}>
              Show comments ({comments.length}) <MdKeyboardArrowDown className="text-xl" />
            </button>
          )}
          {showComments &&
            comments.map((comment) => (
              <Comment comment={comment} key={comment.comment_id} onDelete={handleDeleteComment} />
            ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Likes">
        <Likes likes={likes} />
      </Modal>
      <Slideshow
        selected={slideshowId}
        photos={post.photos}
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
      />
    </div>
  );
}
