import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/Supabase';
import { useAuth } from '../utils/AuthContext';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function Login() {
  const { update } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useDocumentTitle('Log in — Models @ RIT');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      await update();
      navigate('/profile');
    }
  };

  useEffect(() => setError(''), [email, password]);

  return (
    <div className="fixed inset-0 px-5 pt-16 flex flex-row justify-start items-start overflow-hidden">
      <div className="fade-in w-full sm:w-1/2 h-full flex justify-center items-center">
        <form className="w-full max-w-64 flex flex-col justify-start items-start gap-2" onSubmit={handleLogin}>
          <p className="font-serif text-6xl mb-5">Log in</p>

          {error && (
            <p className="mb-5" style={{ color: 'red' }}>
              {error}
            </p>
          )}

          <label htmlFor="email">
            Email <span className="opacity-60">(must be rit.edu)</span>
          </label>
          <input
            className="w-full mb-2"
            type="email"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            pattern="^([a-zA-Z0-9_\-\.]+)@rit.edu$"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            className="w-full mb-5"
            type="password"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="button mb-5 w-full">Log in</button>

          <p className="opacity-75">
            Don't have an account?{' '}
            <Link className="underline" to="/register">
              Register
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden w-1/2 h-full sm:flex justify-center items-center ">
        <div className="h-[20vw] w-[20vw] bg-foreground rounded-full bob"></div>
        <div className="absolute mt-[40vh] h-[40vh] w-[40vw] backdrop-blur bg-background/50 border-t border-background/50"></div>
      </div>
    </div>
  );
}
