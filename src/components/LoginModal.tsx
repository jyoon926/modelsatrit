import { Link } from 'react-router-dom';
import { supabase } from '../utils/Supabase';
import Modal from './Modal';
import { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const { update } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      await update();
      onClose();
    }
  };

  useEffect(() => setError(''), [email, password]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <form className="m-3 w-64 flex flex-col justify-start items-start gap-2" onSubmit={handleLogin}>
        <p className="w-full text-center font-serif text-4xl mb-5">Log in</p>
        {error && (
          <p className="mb-5" style={{ color: 'red' }}>
            {error}
          </p>
        )}

        <input
          className="w-full mb-2"
          type="email"
          name="email"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          pattern="^([a-zA-Z0-9_\-\.]+)@rit.edu$"
          placeholder='Email'
          required
        />

        <input
          className="w-full mb-5"
          type="password"
          name="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
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
    </Modal>
  );
}
