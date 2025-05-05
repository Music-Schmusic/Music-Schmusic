import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import './main.css';
import Spline from '@splinetool/react-spline';
import SplineBackground from './SplineBackground';
import Dashboard from './pages/dashboard';
import Friends from './pages/friends';
import Settings from './pages/settings.jsx';
import Recommended from './pages/recs';
import Form from './components/Form';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import OAuthSuccess from './components/OAuthSuccess';
import Login from './components/Login';
import Signup from './components/Signup';
import StatsIcon from './components/StatsIcon';
import AccountRecovery from './pages/AccountRecovery.jsx';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('spotifyToken');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <StatsIcon size={40} />
        </Link>
      </div>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="nav-button">
              Dashboard
            </Link>
            <Link to="/friends" className="nav-button">
              Friends
            </Link>
            <Link to="/recs" className="nav-button">
              Recommended
            </Link>
            <Link to="/settings" className="nav-button">
              <img
                src="/settings.png"
                alt="Settings"
                style={{ width: '24px', height: '24px' }}
              />
            </Link>
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">
              Login
            </Link>
            <Link to="/signup" className="nav-button">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Footer = () => (
  <nav className="footer">
    <div className="footer-links">
      <a
        href="https://github.com/Music-Schmusic/Music-Schmusic"
        className="footer-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i id="github__logo" className="fa-brands fa-github"></i>
      </a>
    </div>
  </nav>
);

const Home = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      <Navbar></Navbar>
      <Spline className="spline" scene="scene1.splinecode"></Spline>
      <lord-icon
        src="https://cdn.lordicon.com/jpzhmobh.json"
        trigger="loop"
        delay="1500"
        stroke="bold"
        colors="primary:#30e849,secondary:#16c72e"
        style={{ width: '150px', height: '150px' }}
      ></lord-icon>
      <button className="get-started-btn" onClick={handleGetStarted}>
        Get Started
      </button>
    </div>
  );
};

function AppRoutes({
  isLoggedIn,
  setIsLoggedIn,
  currentScene,
  setCurrentScene,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/protected', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Unauthorized');

        setIsLoggedIn(true);
      } catch (err) {
        console.log('Token invalid or expired:', err.message);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
      }
    };

    checkAuth();
  }, [location.pathname]);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home setCurrentScene={setCurrentScene} />} />
        <Route
          path="/login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setCurrentScene={setCurrentScene}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              setIsLoggedIn={setIsLoggedIn}
              setCurrentScene={setCurrentScene}
            />
          }
        />
        <Route
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} redirectTo="/login" />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/recs" element={<Recommended />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route
          path="/oauths"
          element={<OAuthSuccess setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

const AppContent = ({
  isLoggedIn,
  setIsLoggedIn,
  currentScene,
  setCurrentScene,
}) => {
  const location = useLocation();
  const showSpline = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      {showSpline && <SplineBackground currentScene={currentScene} />}
      <AppRoutes
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
      />
      <Footer />
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScene, setCurrentScene] = useState('scene1.splinecode');

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
      />
    </Router>
  );
}

export default App;
