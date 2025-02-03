import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import "./main.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Music Shmusic</Link>
      </div>
      <div className="nav-links">
        <Link to="/login" className="nav-button">Login</Link>
        <Link to="/signup" className="nav-button">Sign Up</Link>
      </div>
    </nav>
  );
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Welcome to Music Shmusic</h1>
      
      {/* Free Animated Logo from lordicon.com */}
      <lord-icon
        src="https://cdn.lordicon.com/jpzhmobh.json"
        trigger="loop"
        delay="2000"
        stroke="bold"
        colors="primary:#30e849,secondary:#16c72e"
        style={{ width: "150px", height: "150px" }}
      ></lord-icon>
      
      <button className="get-started-btn" onClick={() => navigate("/login")}>
        Get Started
      </button>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <h1>Login</h1>
      <p>Sign in to continue</p>
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account?</p>
      <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
      <button className="back-btn" onClick={() => navigate("/")}>Back to Home</button>
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
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account?</p>
      <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
      <button className="back-btn" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.lordicon.com/lordicon.js";
    script.async = true;
    script.onload = () => console.log("Lordicon script loaded");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

//fix for visual glitch with state of clicking button causing style issues
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("mouseup", function() {
      setTimeout(() => this.blur(), 100); // Remove focus a moment after clicking
  });
});


export default App;
