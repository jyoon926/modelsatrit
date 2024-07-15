import { Link } from "react-router-dom";
import { User } from "../utils/Types";
import { getInitials } from "../utils/RenderUtils";

interface Props {
  user: User,
  size?: string
}

export default function({ user, size }: Props) {
  return (
    <>
      {
        user.profile_photo ?
          <Link className={"profile-picture " + size} style={{backgroundImage: `url(${user.profile_photo})`}} to={""} />
        :
          <Link className={"profile-picture bg-stone-300 " + size} to={""}>{getInitials(user.display_name)}</Link>
      }
    </>
  )
}