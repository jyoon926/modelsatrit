import { Link } from "react-router-dom"
import { useAuth } from "../utils/AuthContext";

export default function Header() {
  const { session, logout } = useAuth();

  return (
    <>
      <div className={"fixed w-full flex flex-row justify-between items-center px-5 h-16 z-40 header"}>
        <div className="flex flex-row items-center gap-10">
          <Link to="/" className="flex flex-row items-center">
            <img className="w-12 mr-3" src="/images/logo-transparent-700.png" alt="Logo" />
            <p className="text-2xl font-serif">Models @ RIT</p>
          </Link>
          <div className="flex flex-row items-center gap-7">
            <Link className="link" to="/models">Models</Link>
            <Link className="link" to="/photographers">Photographers</Link>
            <Link className="link" to="/community">Community</Link>
            <Link className="link" to="/about">About</Link>
          </div>
        </div>
        {session ?
          <div className="flex flex-row items-center gap-7">
            <button className="link" onClick={logout}>Log out</button>
            <Link className="button small" to="/profile">Profile</Link>
          </div>
        :
          <div className="flex flex-row items-center gap-7">
            <Link className="link" to="/login">Log in</Link>
            <Link className="button small" to="/register">Register</Link>
          </div>
        }
      </div>
      <div className='blur fixed top-0 left-0 w-full h-20 z-30 pointer-events-none'></div>
    </>
  )
}
