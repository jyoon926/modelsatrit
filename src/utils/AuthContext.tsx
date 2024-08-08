import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { AuthSession, Session } from '@supabase/supabase-js';
import { RoutesProps } from 'react-router-dom';
import { User } from './Types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  update: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: RoutesProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getSession = async () => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await fetchUser(session!);
    });
  };

  const fetchUser = async (_session: AuthSession) => {
    if (_session) {
      const { data, error } = await supabase.from('users').select('*').eq('email', _session.user.email).single();
      if (!error) {
        setUser(data);
      }
    }
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const update = async () => {
    if (session) await fetchUser(session);
    else await getSession();
  };

  useEffect(() => {
    update();
  }, []);

  return <AuthContext.Provider value={{ user, session, loading, logout, update }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
