import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/Supabase';
import { useAuth } from '../utils/AuthContext';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function Register() {
  const { update } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useDocumentTitle('Register — Models @ RIT');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const { error } = await supabase
        .from('user')
        .insert([{ auth_id: data.user?.id, name, email }])
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
    <div className="fixed inset-0 px-5 pt-16 flex flex-row justify-start items-start">
      <div className="fade-in w-full sm:w-1/2 h-full flex justify-center items-center">
        <form className="w-full max-w-64 flex flex-col justify-start items-start gap-2" onSubmit={handleRegister}>
          <p className="font-serif text-6xl mb-5">Register</p>

          {error && (
            <p className="mb-5" style={{ color: 'red' }}>
              {error}
            </p>
          )}

          <label htmlFor="name">Full Name</label>
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
            className="w-full mb-2"
            type="password"
            id="password"
            onChange={(e) => confirmPassword(e.target.value)}
            ref={confirmPasswordRef}
            required
          />

          <button className="button mt-3 w-full">Register</button>

          <p className="opacity-75 mt-3">
            Already have an account?{' '}
            <Link className="underline" to="/login">
              Log in
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden sm:flex w-1/2 h-full justify-center items-center">
        <div className="h-[20vw] w-[20vw] bg-foreground rounded-full bob"></div>
        <div className="absolute mt-[40vh] h-[40vh] w-[40vw] backdrop-blur bg-background/50 border-t border-background/50"></div>
      </div>
    </div>
  );
}
