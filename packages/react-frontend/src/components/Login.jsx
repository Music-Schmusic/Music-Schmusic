import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ setIsLoggedIn, setCurrentScene }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showContainer, setShowContainer] = useState(false);
  const [user, setUser] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowContainer(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentScene('scene2.splinecode');
  }, [setCurrentScene]);

  function handleNav() {
    navigate('/accountrecovery');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { username, password },
        { withCredentials: true }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('isLoggedIn', 'true');

      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid Login Information');
    }
  };

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
      <button type="nav-accountRecovery" onClick={handleNav}>
        Forgot password?
      </button>
    </div>
  );
};

export default Login;
