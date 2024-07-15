import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./AuthContext"

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) return <div></div>

  return session ? <Outlet context={session.user} /> : <Navigate to="/login" />
}
