import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from 'react-router-dom';
import './main.css';

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

const Footer = () => {
  return (
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
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Welcome to Music Shmusic</h1>
      <lord-icon
        src="https://cdn.lordicon.com/jpzhmobh.json"
        trigger="loop"
        delay="1500"
        stroke="bold"
        colors="primary:#30e849,secondary:#16c72e"
        style={{ width: '150px', height: '150px' }}
      ></lord-icon>
      <button className="get-started-btn" onClick={() => navigate('/login')}>
        Get Started
      </button>
    </div>
  );
};

//Dashboard page to show on successful login, can help test successful logins
//this will need to be updated later, maybe moving logic to a seperate file
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p>You are now logged in!</p>
    </div>
  );
};

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  //currently any input creates a successful login, this will need to be updated with checks to the backend
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); // Store login state
    navigate('/dashboard'); // Redirect after login
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <p>Sign in to continue</p>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account?</p>
      <button className="signup-btn" onClick={() => navigate('/signup')}>
        Sign Up
      </button>
      <button className="back-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <p>Create an account to get started</p>
      <form>
        <input type="text" placeholder="Username" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account?</p>
      <button className="login-btn" onClick={() => navigate('/login')}>
        Login
      </button>
      <button className="back-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.lordicon.com/lordicon.js';
    script.async = true;
    script.onload = () => console.log('Lordicon script loaded');
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = 'https://kit.fontawesome.com/ab74e91db0.js';
    script2.crossOrigin = 'anonymous';
    script2.async = true;
    script2.onload = () => console.log('FontAwesome loaded');
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Home />}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

// Fix for clicking buttons causing style issues
document.querySelectorAll('a', 'button').forEach((link) => {
  link.addEventListener('mouseup', function () {
    setTimeout(() => this.blur(), 100);
  });
});

export default App;
