import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import "./main.css";
import SplineBackground from "./SplineBackground";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Music Shmusic</Link>
      </div>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="nav-button">Dashboard</Link>
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
      <a href="https://github.com/Music-Schmusic/Music-Schmusic" className="footer-button" target="_blank" rel="noopener noreferrer">
        <i id="github__logo" className="fa-brands fa-github"></i>
      </a>
    </div>
  </nav>
);

const Home = ({ setCurrentScene }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setCurrentScene("https://prod.spline.design/P5e3rxXx8Iuj6Eeu/scene.splinecode");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <lord-icon
        src="https://cdn.lordicon.com/jpzhmobh.json"
        trigger="loop"
        delay="1500"
        stroke="bold"
        colors="primary:#30e849,secondary:#16c72e"
        style={{ width: "150px", height: "150px" }}
      ></lord-icon>
      <button className="get-started-btn" onClick={handleGetStarted}>
        Get Started
      </button>
    </div>
  );
};

const Dashboard = () => (
  <div className="dashboard-container">
    <h1>Welcome to Your Dashboard</h1>
    <p>You are now logged in!</p>
  </div>
);

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    navigate("/dashboard");
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
      <button className="signup-btn" onClick={() => navigate("/signup")}>
        Sign Up
      </button>
      <button className="back-btn" onClick={() => navigate("/")}>
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
      <button className="login-btn" onClick={() => navigate("/login")}>
        Login
      </button>
      <button className="back-btn" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

function MyApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  const [currentScene, setCurrentScene] = useState("https://prod.spline.design/p0-zCGqo6Vm1HjXy/scene.splinecode");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.lordicon.com/lordicon.js";
    script.async = true;
    document.body.appendChild(script);

    const script2 = document.createElement("script");
    script2.src = "https://kit.fontawesome.com/ab74e91db0.js";
    script2.crossOrigin = "anonymous";
    script2.async = true;
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <Router>
      <SplineBackground currentScene={currentScene} />
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home setCurrentScene={setCurrentScene} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Home setCurrentScene={setCurrentScene} />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default MyApp;
