import { Link } from "react-router-dom"
import { Comment as IComment, Like } from "../utils/Types"
import { getRelativeTime } from "../utils/RenderUtils"
import ProfilePicture from "./ProfilePicture"
import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { useAuth } from "../utils/AuthContext"
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io"
import Modal from "./Modal"
import Likes from "./Likes"

interface Props {
  comment: IComment
}

export default function Comment({ comment }: Props) {
  const { user } = useAuth()
  const [likes, setLikes] = useState<Like[]>([])
  const [liked, setLiked] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLikes = async () => {
    const { data, error } = await supabase.from('likes').select('*, user:users(*)').eq('comment_id', comment.comment_id)
    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setLikes(data)
      setLiked(data.find(like => like.user_id === user?.user_id))
    }
  }

  useEffect(() => {
    fetchLikes()
  }, [])

  const handleLike = async () => {
    if (!user) return
    if (liked) {
      const { error } = await supabase.from('likes').delete().eq('user_id', user?.user_id).eq('comment_id', comment.comment_id)
      if (!error) {
        fetchLikes()
      }
    } else {
      const { error } = await supabase.from('likes').insert([{ comment_id: comment.comment_id, user_id: user?.user_id }])
      if (!error) {
        fetchLikes()
      }
    }
  }

  return (
    <div className="w-full flex flex-row justify-start items-start gap-3 pl-3">
      <ProfilePicture user={comment.user} />
      <div className="w-full">
        <p className="w-full leading-snug break-words">
          <Link className="font-bold mr-1" to={""}>{comment.user.display_name}</Link> {comment.content}
        </p>
        <span className="opacity-60 text-xs mt-1">{getRelativeTime(comment.created_at)}</span>
      </div>
      <div className="flex flex-row items-center gap-1 text-red-500 text-xs mt-[9px]">
        <button onClick={() => setIsModalOpen(true)}>
          {likes.length > 0 && likes.length}
        </button>
        <button onClick={() => handleLike()}>
          {
            liked ?
              <IoMdHeart className="text-xl" />
            :
              <IoMdHeartEmpty className="text-xl" />
          }
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Likes">
        <Likes onClose={() => setIsModalOpen(false)} likes={likes} />
      </Modal>
    </div>
  )
}