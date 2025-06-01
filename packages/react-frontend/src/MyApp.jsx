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
// import Spline from '@splinetool/react-spline';
// import SplineBackground from './SplineBackground';
import Dashboard from './pages/dashboard';
import Friends from './pages/friends';
import Settings from './pages/settings.jsx';
import Recommended from './pages/recs';
import Form from './components/Form';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import OAuthSuccess from './components/OAuthSuccess';
import Login from './components/Login';
import SignUp from './components/Signup';
import StatsIcon from './components/StatsIcon';
import AccountRecovery from './pages/AccountRecovery.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ResetValidation from './pages/ResetValidation.jsx';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import Lottie from 'lottie-react';
import defaultAnim from './lottie/default.json';

const API_URL = import.meta.env.VITE_API_URL;
const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('spotifyToken');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatsIcon size={40} />
        </Link>
      </div>
  
      <button className="hamburger" onClick={toggleMenu}>
        &#9776;
      </button>
  
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="nav-button">Dashboard</Link>
            <Link to="/recs" className="nav-button">Recommended</Link>
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/signup" className="nav-button">Sign Up</Link>
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
  const handleGetStarted = () => navigate('/login');

  return (
    <div className="splash-container">
  <div className="background-wrapper">
    <div className="background-gradient"></div>
    <div className="background-overlay"></div>
  </div>

  {/* This sits ABOVE the background, not inside it */}
  <div className="splash-hero">
    <h1 className="splash-title">Music Schmusic</h1>
    <p className="splash-subtitle">
      Your personalized music dashboard powered by Spotify.
    </p>
    <Lottie animationData={defaultAnim} loop autoplay className="genre-lottie" />
    <button className="get-started-btn" onClick={handleGetStarted}>
      Get Started
    </button>
  </div>
</div>
  );
};

function AppRoutes({
  isLoggedIn,
  setIsLoggedIn,
  currentScene,
  setCurrentScene,
  tempLogin,
  setTempLogin,
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
        const res = await fetch(`${API_URL}/protected`, {
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
          element={
            <PublicRoute isLoggedIn={isLoggedIn} redirectTo="/dashboard" />
          }
        >
          <Route
            path="/login"
            element={
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setCurrentScene={setCurrentScene}
              />
            }
          />
          <Route path="/accountrecovery" element={<AccountRecovery />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/resetvalidation"
            element={
              <ResetValidation
                tempLogin={tempLogin}
                setTempLogin={setTempLogin}
              />
            }
          />
        </Route>
        <Route
          element={<ProtectedRoute isLoggedIn={tempLogin} redirectTo={'/'} />}
        >
          <Route
            path="/resetpassword"
            element={
              <ResetPassword
                tempLogin={tempLogin}
                setTempLogin={setTempLogin}
              />
            }
          />
        </Route>
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
  tempLogin,
  setTempLogin,
}) => {
  const location = useLocation();
  // const showSpline = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      {/* {showSpline && <SplineBackground currentScene={currentScene} />} */}
      <AppRoutes
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
        tempLogin={tempLogin}
        setTempLogin={setTempLogin}
      />
      
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tempLogin, setTempLogin] = useStateWithCallbackLazy(false);
  const [currentScene, setCurrentScene] = useState('scene1.splinecode');

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        tempLogin={tempLogin}
        setTempLogin={setTempLogin}
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
      />
    </Router>
  );
}

export default App;
