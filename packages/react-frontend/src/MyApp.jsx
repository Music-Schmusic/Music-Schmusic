import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import "./main.css";
import SplineBackground from "./SplineBackground";
import Dashboard from "./pages/dashboard";
import Friends from "./pages/friends";
import Recommended from "./pages/recs";
import Form from "./components/Form";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

// 🏆 Navbar Component
const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // Persist logout state
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
            <Link to="/friends" className="nav-button">Friends</Link>
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

// 🏆 Footer Component
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

// 🏆 Home Component
const Home = ({ onGetStarted }) => {
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
      <button className="get-started-btn" onClick={onGetStarted}>
        Get Started
      </button>
    </div>
  );
};

// 🏆 Login Component
const Login = ({ setIsLoggedIn }) => {
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true"); // Store login state
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
    </div>
  );
};

// 🏆 Signup Component
const SignUp = () => {
  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <p>Create an account to get started</p>
      <Form />
    </div>
  );
};

// 🏆 App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  return (
    <Router>
      <SplineBackground />
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        {/* ✅ Public Routes - Only Accessible if NOT Logged In */}
        <Route element={<PublicRoute isLoggedIn={isLoggedIn} redirectTo="/dashboard" />}>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* ✅ Protected Routes - Only Accessible if Logged In */}
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} redirectTo="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/recs" element={<Recommended />} />
        </Route>

        {/* ✅ Home Page (Always Accessible) */}
        <Route path="/" element={<Home onGetStarted={() => setIsLoggedIn(false)} />} />

        {/* ✅ Catch-all Route to Redirect Unmatched Paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
