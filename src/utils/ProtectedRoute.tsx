import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div></div>;
  return user ? <Outlet context={user} /> : <Navigate to="/login" />;
}
