import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../utils/AuthContext';

export default function Register() {
  const { update } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const { error } = await supabase
        .from('users')
        .insert([{ auth_id: data.user?.id, display_name: name, email }])
        .select('*');
      if (error) {
        setError(error.message);
      } else {
        await update();
        navigate('/profile');
      }
    }
  };

  const confirmPassword = (input: string) => {
    if (input === password) {
      confirmPasswordRef.current?.setCustomValidity('');
    } else {
      confirmPasswordRef.current?.setCustomValidity('Passwords do not match');
    }
  };

  useEffect(() => setError(''), [email, password]);

  return (
    <div className="w-full h-screen px-5 pt-16 flex flex-row justify-start items-start">
      <div className="fade-in w-1/2 h-full flex justify-center items-center">
        <form className="w-full max-w-64 flex flex-col justify-start items-start gap-2" onSubmit={handleRegister}>
          <p className="font-serif text-6xl mb-5">Register</p>

          {error && (
            <p className="mb-5" style={{ color: 'red' }}>
              {error}
            </p>
          )}

          <label htmlFor="name">Name</label>
          <input className="w-full mb-2" type="text" id="name" onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="email">
            Email <span className="opacity-60">(must be rit.edu)</span>
          </label>
          <input
            className="w-full mb-2"
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            pattern="^([a-zA-Z0-9_\-\.]+)@rit.edu$"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            className="w-full mb-2"
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="password">Confirm Password</label>
          <input
            className="w-full mb-5"
            type="password"
            id="password"
            onChange={(e) => confirmPassword(e.target.value)}
            ref={confirmPasswordRef}
            required
          />

          <button className="button mb-5 w-full">Register</button>

          <p className="opacity-75">
            Already have an account?{' '}
            <Link className="underline" to="/login">
              Log in
            </Link>
          </p>
        </form>
      </div>
      <div className="w-1/2 h-full flex justify-center items-center">
        <div className="h-[20vw] w-[20vw] bg-foreground rounded-full bob"></div>
        <div className="absolute mt-[40vh] h-[40vh] w-[40vw] backdrop-blur bg-background/50 border-t border-background/50"></div>
      </div>
    </div>
  );
}
