import "./App.scss"
import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./components/Home"
import { useEffect } from "react"
import Models from "./components/Models"
import About from "./components/About"
import Login from "./components/Login"
import Register from "./components/Register"
import Model from "./components/Model"
import Photographers from "./components/Photographers"
import Community from "./components/Community"
import Header from "./components/Header"
import Profile from "./components/Profile"
import { AuthProvider } from "./utils/AuthContext"
import ProtectedRoute from "./utils/ProtectedRoute"
import Photographer from "./components/Photographer"

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <AuthProvider>
      <Header></Header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/models" element={<Models />} />
        <Route path="/models/:email" element={<Model />} />
        <Route path="/photographers" element={<Photographers />} />
        <Route path="/photographers/:email" element={<Photographer />} />
        <Route path="/community" element={<Community />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route path="" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
