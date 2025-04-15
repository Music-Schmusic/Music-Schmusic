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
import SplineBackground from './SplineBackground';
import Dashboard from './pages/dashboard';
import Friends from './pages/friends';
import Settings from './pages/settings.jsx';
import Recommended from './pages/recs';
import Form from './components/Form';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import OAuthSuccess from './components/OAuthSuccess';
import AccountRecovery from './pages/AccountRecovery.jsx';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Music Shmusic</Link>
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

const Home = ({ setCurrentScene }) => {
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentScene('scene1.splinecode');
  }, [setCurrentScene]);

  const handleGetStarted = () => {
    setCurrentScene('/scene2.splinecode');
    navigate('/login');
  };

  return (
    <div className="home-container">
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

const Login = ({ setIsLoggedIn, setCurrentScene }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContainer(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentScene('scene2.splinecode');
  }, [setCurrentScene]);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { token, username: user } = await res.json();
      localStorage.setItem('token', token);
      localStorage.setItem('username', user);
      localStorage.setItem('isLoggedIn', 'true');

      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid Login Information');
    }
  }

  if (!showContainer) return null;

  return (
    <div className="login-container">
      <h1>Login</h1>
      <p>Sign in to continue</p>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <button
        type="forgotPassword"
        onClick={() => navigate('/accountrecovery')}
      >
        Forgot Passsword?{' '}
      </button>
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();

  function postAccount(account) {
    return fetch('http://localhost:8000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
  }

  function authorizeAccount() {
    return fetch('http://localhost:8000/authorize');
  }

  function handleSubmit(account) {
    postAccount(account)
      .then((res) => {
        if (res.status === 201) {
          authorizeAccount()
            .then((response) => response.json())
            .then((response) => window.open(response.authUrl, ''))
            .catch(console.error);
          navigate('/login');
        } else if (res.status === 409) {
          return res.text();
        }
      })
      .then((text) => {
        if (text) window.alert(text);
      })
      .catch(console.error);
  }

  return (
    <div className="signup-container">
      <h3>Create an account to get started</h3>
      <h1>Sign Up</h1>
      <div className="boxes">
        <Form handleSubmit={handleSubmit} />
      </div>
      <h6> </h6>
      <h5>Already have an account?</h5>
      <button className="login-btn" onClick={() => navigate('/login')}>
        Login
      </button>
      <button className="back-btn" onClick={() => navigate('/')}>
        Back to Home
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

        <Route path="/" element={<Home setCurrentScene={setCurrentScene} />} />
        <Route
          path="/oauth-success"
          element={<OAuthSuccess setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScene, setCurrentScene] = useState('scene1.splinecode');

  return (
    <Router>
      <SplineBackground currentScene={currentScene} />
      <AppRoutes
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
      />
      <Footer />
    </Router>
  );
}

export default App;
