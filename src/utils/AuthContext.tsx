import { createContext, ReactElement, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { AuthSession, Session } from '@supabase/supabase-js'
import { RoutesProps } from 'react-router-dom'
import { User } from './types'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: RoutesProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async (_session: AuthSession) => {
      const { data, error } = await supabase.from('users').select('*').eq('email', _session.user.email).single()
      if (error) {
        console.error('Error fetching user:', error)
      } else {
        setUser(data)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      fetchUser(session!)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      fetchUser(session!)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
