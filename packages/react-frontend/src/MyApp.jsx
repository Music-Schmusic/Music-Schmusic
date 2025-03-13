import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useNavigate,
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


// Navbar Component
const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn'); // Persist logout state
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

// Footer Component
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

// Home Component
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

// Login Component
const Login = ({ setIsLoggedIn, setCurrentScene }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showContainer, setShowContainer] = useState(false);

  // Delay rendering the login container by 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContainer(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Set the Spline scene when the login page loads
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

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      const userData = await res.json();
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', userData.username);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid Login Information');
    }
  }

  // If not ready to show, return nothing (or you could return a spinner, etc.)
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
    </div>
  );
};

// Signup Component
const SignUp = (props) => {
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
          //request auth code upon sign up
          authorizeAccount()
            .then((response) => response.json())
            .then((response) => {
              //open new tab to request signin/authorization
              window.open(response.authUrl, '');
            })
            .catch(console.error);
          navigate('/login');
          console.log('Success');
          return undefined;
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

// App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const [currentScene, setCurrentScene] = useState(
    'scene1.splinecode' // Default scene URL
  );

  return (
    <>
      <Router>
        <SplineBackground currentScene={currentScene} />
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          {/* Public Routes - Only Accessible if NOT Logged In */}
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
            <Route path="/signup" element={<SignUp login={setIsLoggedIn} />} />
          </Route>

          {/* Protected Routes - Only Accessible if Logged In */}
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

          {/* Home Page (Always Accessible) */}
          <Route
            path="/"
            element={<Home setCurrentScene={setCurrentScene} />}
          />
          {/* Catch-all Route to Redirect Unmatched Paths */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Footer />
      </Router>
    </>
  );
}

export default App;
