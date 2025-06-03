import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
const API_URL = import.meta.env.VITE_API_URL;

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/signup`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        const authResponse = await axios.get(`${API_URL}/authorize/authorize`, {
          withCredentials: true,
        });
        window.open(authResponse.data.authUrl, '_self');
      }
    } catch (err) {
      if (err.status === 409) {
        console.log('Username already in use');
        setError('Username already in use');
      } else {
        setError(err.response?.data?.message || 'Sign Up failed');
      }
    }
  };

  return (
    <div className="splash-container">
    <div className="signup-container">
      <h3>Create an account to get started</h3>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account?</p>
      <button onClick={() => navigate('/login')} className="login-btn">
        Login
      </button>
      <button onClick={() => navigate('/')} className="back-btn">
        Back to Home
      </button>
    </div>
    </div>
  );
};

export default Signup;
