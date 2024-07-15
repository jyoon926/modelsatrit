import { Link } from "react-router-dom"
import { Comment, Like, Post } from "../utils/types"
import { getRelativeTime } from "../utils/renderUtils"
import { useAuth } from "../utils/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md"
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io"
import ProfilePicture from "./ProfilePicture"

interface Props {
  post: Post
}

export default function PostCard({ post }: Props) {
  const { user } = useAuth()
  const [commentText, setCommentText] = useState<string>("")
  const [comments, setComments] = useState<Comment[]>([])
  const [postLikes, setPostLikes] = useState<Like[]>([])
  const [postLiked, setPostLiked] = useState<boolean>(false)
  const [showComments, setShowComments] = useState<boolean>(false)

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select('*, user:users(*), likes:likes(*)').eq('post_id', post.post_id).order('created_at', { ascending: false })
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
      setPostLikes(data)
      setPostLiked(data.find(like => like.user_id === user?.user_id))
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

  const handlePostLike = async () => {
    if (postLiked) {
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
        <button className="flex flex-row items-center gap-1 text-red-500" onClick={() => handlePostLike()}>
          {
            postLiked ?
              <IoMdHeart className="text-2xl" />
            :
              <IoMdHeartEmpty className="text-2xl" />
          }
          {postLikes.length}
        </button>
        <div className="flex flex-row ml-[10px]">
          {postLikes.slice(0, 10).map(like => (
            <div className="ml-[-10px]" key={like.like_id}>
              <ProfilePicture user={like.user} key={like.like_id} size="sm" />
            </div>
          ))}
        </div>
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
            <div className="w-full flex flex-row justify-start items-start gap-3 px-3" key={comment.comment_id}>
              <ProfilePicture user={comment.user} />
              <p className="w-full leading-snug break-words">
                <Link className="font-bold mr-1" to={""}>{comment.user.display_name}</Link> {comment.content}
                <p className="opacity-60 text-xs mt-1">{getRelativeTime(comment.created_at)}</p>
              </p>
            </div>
          ))}
        </div>
      }
    </div>
  )
}