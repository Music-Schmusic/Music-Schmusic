import React, { useEffect, useState, useRef } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from 'react-router-dom';
import './main.css';
import SplineBackground from './SplineBackground';
import Dashboard from './pages/dashboard';
import Friends from './pages/friends';
import Recommended from './pages/recs';
import Form from './components/Form';

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
            <Link to="/dashboard"> </Link>
            <Link to="/friends" className="nav-button">
              Friends
            </Link>
            <Link to="/recs" className="nav-button">
              Recommended
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

const Home = ({ onGetStarted }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    onGetStarted();
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

  function postAccount(account) {
    const promise = fetch('Http://localhost:8000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(account),
    });

    return promise;
  }

  function handleSubmit(account) {
    postAccount(account)
      .then((res) => {
        if (res.status === 201) {
          console.log('Success');
          return undefined;
        } else if (res.status === 409) {
          return res.text();
        }
      })
      .then((text) => {
        if (text) {
          window.alert(text);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <p>Create an account to get started</p>
      <Form handleSubmit={handleSubmit} />
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

  const [sceneSwitched, setSceneSwitched] = useState(false);

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
      <SplineBackground switchScene={sceneSwitched} />
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route
          path="/"
          element={<Home onGetStarted={() => setSceneSwitched(true)} />}
        />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Home />}
        />
        <Route path="/friends" element={isLoggedIn ? <Friends /> : <Home />} />
        <Route path="/recs" element={isLoggedIn ? <Recommended /> : <Home />} />
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
