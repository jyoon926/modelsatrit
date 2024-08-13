import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import ProfilePhoto from './ProfilePhoto';
import { useState } from 'react';

export default function Header() {
  const { session, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className={'fixed w-full flex flex-row justify-between items-center px-5 h-16 z-40 header'}>
        <div className="flex flex-row items-center gap-10">
          {/* Logo */}
          <Link to="/" className="flex flex-row items-center">
            <img className="w-12 mr-3" src="/images/logo-transparent-700.png" alt="Logo" />
            <p className="text-2xl font-serif">Models @ RIT</p>
          </Link>
          {/* Main links */}
          <div className="hidden md:flex flex-row items-center gap-7">
            <Link className="link" to="/models">
              Models
            </Link>
            <Link className="link" to="/photographers">
              Photographers
            </Link>
            <Link className="link" to="/community">
              Community
            </Link>
            <Link className="link" to="/about">
              About
            </Link>
          </div>
        </div>
        {/* Right links */}
        <div className="hidden md:flex">
          {session && user ? (
            <div className="flex flex-row items-center gap-3">
              <Link to={'/profile/' + user.email}>{user.display_name}</Link>
              <ProfilePhoto user={user} />
            </div>
          ) : (
            <div className="flex flex-row items-center gap-7">
              <Link className="link" to="/login">
                Log in
              </Link>
              <Link className="button sm" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="blur fixed top-0 left-0 w-full h-24 z-30 pointer-events-none"></div>
      {/* Mobile menu */}
      <div className="md:hidden">
        <button
          className="fixed top-0 right-0 p-5 w-8 h-5 box-content flex flex-col justify-center items-center z-40"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div
            className={`absolute w-8 border-t border-foreground mb-3 duration-300 origin-center ${showMenu ? 'rotate-[45deg] w-7 mb-0' : ''}`}
          ></div>
          <div className={`absolute w-8 border-t border-foreground duration-300 ${showMenu ? 'opacity-0' : ''}`}></div>
          <div
            className={`absolute w-8 border-t border-foreground mt-3 duration-300 origin-center ${showMenu ? 'rotate-[-45deg] w-7 mt-0' : ''}`}
          ></div>
        </button>
        <div
          className={`fixed w-full h-full top-0 left-0 bg-background p-5 pt-28 flex flex-col items-start gap-4 z-30 text-2xl duration-300 ${!showMenu ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <Link className="font-serif" to="/models" onClick={() => setShowMenu(false)}>
            Models
          </Link>
          <Link className="font-serif" to="/photographers" onClick={() => setShowMenu(false)}>
            Photographers
          </Link>
          <Link className="font-serif" to="/community" onClick={() => setShowMenu(false)}>
            Community
          </Link>
          <Link className="font-serif" to="/about" onClick={() => setShowMenu(false)}>
            About
          </Link>
          {session && user ? (
            <div className="flex flex-row items-center gap-3 border-t pt-4 w-full">
              <Link className="font-serif" to={'/profile/' + user.email} onClick={() => setShowMenu(false)}>
                {user.display_name}
              </Link>
              <span onClick={() => setShowMenu(false)}>
                <ProfilePhoto user={user} />
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-start border-t pt-4 w-full">
              <Link className="font-serif" to="/login" onClick={() => setShowMenu(false)}>
                Log in
              </Link>
              <Link className="font-serif button" to="/register" onClick={() => setShowMenu(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
