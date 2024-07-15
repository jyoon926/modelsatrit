import { Link } from "react-router-dom"
import { Like } from "../utils/Types"
import ProfilePicture from "./ProfilePicture"

interface Props {
  onClose: () => void
  likes: Like[]
}

export default function Likes({ onClose, likes }: Props) {
  return (
    <div className="flex flex-col gap-3 w-64">
      {likes.map(like => (
        <div className="flex flex-row gap-3 items-center">
          <ProfilePicture user={like.user} />
          <Link to="">{like.user.display_name}</Link>
        </div>
      ))}
    </div>
  )
}