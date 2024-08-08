import './App.scss';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Home from './pages/Home';
import Models from './pages/Models';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Model from './pages/Model';
import Photographers from './pages/Photographers';
import Community from './pages/Community';
import Header from './components/Header';
import Profile from './pages/Profile';
import Photographer from './pages/Photographer';
import PublicProfile from './pages/PublicProfile';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
        <Route path="/profile/:email" element={<PublicProfile />} />
      </Routes>
    </AuthProvider>
  );
}
