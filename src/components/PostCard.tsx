import { Link } from "react-router-dom"
import { Comment as IComment, Like, Post } from "../utils/Types"
import { useAuth } from "../utils/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md"
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io"
import ProfilePicture from "./ProfilePicture"
import Comment from "./Comment"
import { getRelativeTime } from "../utils/RenderUtils"
import Likes from "./Likes"
import Modal from "./Modal"

interface Props {
  post: Post
}

export default function PostCard({ post }: Props) {
  const { user } = useAuth()
  const [commentText, setCommentText] = useState<string>("")
  const [comments, setComments] = useState<IComment[]>([])
  const [likes, setLikes] = useState<Like[]>([])
  const [liked, setLiked] = useState<boolean>(false)
  const [showComments, setShowComments] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select('*, user:users(*), likes:likes(*), post:posts(*)').eq('post_id', post.post_id).order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setComments(data)
    }
  }

  const fetchLikes = async () => {
    const { data, error } = await supabase.from('likes').select('*, user:users(*)').eq('post_id', post.post_id)
    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setLikes(data)
      setLiked(data.find(like => like.user_id === user?.user_id))
    }
  }

  useEffect(() => {
    fetchComments()
    fetchLikes()
  }, [])

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('comments').insert([{ post_id: post.post_id, user_id: user?.user_id, content: commentText }])
    if (!error) {
      setCommentText('')
      setShowComments(true)
      fetchComments()
    }
  }

  const handleLike = async () => {
    if (!user) return
    if (liked) {
      const { error } = await supabase.from('likes').delete().eq('user_id', user?.user_id).eq('post_id', post.post_id)
      if (!error) {
        fetchLikes()
      }
    } else {
      const { error } = await supabase.from('likes').insert([{ post_id: post.post_id, user_id: user?.user_id }])
      if (!error) {
        fetchLikes()
      }
    }
  }

  return (
    <div className="w-full flex flex-col justify-start items-start border rounded-xl p-5 gap-5" key={post.post_id}>
      {/* Top */}
      <div className="flex flex-row justify-center items-center gap-3">
        <ProfilePicture user={post.user} size="lg" />
        <div>
          <Link className="font-bold" to={""}>{post.user.display_name}</Link>
          <p className="text-sm opacity-60">{getRelativeTime(post.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="w-full text-lg break-words">{post.caption}</p>
      {post.photos && <img className="w-full rounded" src={post.photos[0]} alt="" />}

      {/* Likes */}
      <div className="flex flex-row items-center gap-3">
        <button className="flex flex-row items-center gap-1 text-red-500" onClick={() => handleLike()}>
          {
            liked ?
              <IoMdHeart className="text-2xl" />
            :
              <IoMdHeartEmpty className="text-2xl" />
          }
          {likes.length}
        </button>
        <button className="flex flex-row ml-[10px]" onClick={() => setIsModalOpen(true)}>
          {likes.slice(0, 10).map(like => (
            <div className="ml-[-10px]" key={like.like_id}>
              <ProfilePicture user={like.user} key={like.like_id} size="sm" />
            </div>
          ))}
        </button>
      </div>

      {/* Comment input */}
      {
        user &&
        <form className="w-full flex flex-row justify-start items-center gap-2" onSubmit={handleCommentSubmit}>
          <ProfilePicture user={user!} />
          <input
            className="w-full border-none"
            type="text"
            placeholder="Add a comment..."
            maxLength={500}
            value={commentText}
            onChange={handleCommentChange}
            required
          />
          <button className="link font-bold">Post</button>
        </form>
      }

      {/* Comments */}
      {comments.length > 0 &&
        <div className="w-full flex flex-col items-start gap-5">
          {showComments ?
            <button className="flex flex-row items-center opacity-60 link" onClick={() => setShowComments(false)}>
              Hide comments <MdKeyboardArrowUp className="text-xl" />
            </button>
          :
            <button className="flex flex-row items-center opacity-60 link" onClick={() => setShowComments(true)}>
              Show comments ({comments.length}) <MdKeyboardArrowDown className="text-xl" />
            </button>
          }
          {showComments && comments.map(comment => (
            <Comment comment={comment} key={comment.comment_id} />
          ))}
        </div>
      }
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Likes">
        <Likes onClose={() => setIsModalOpen(false)} likes={likes} />
      </Modal>
    </div>
  )
}