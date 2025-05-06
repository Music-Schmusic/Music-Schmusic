import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

export default function ResetValidation({ tempLogin, setTempLogin }) {
  const navigate = useNavigate();
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const token = {
    token: urlParams.get('token'),
  };

  async function validateToken() {
    try {
      const res = await fetch(`${API_URL}/resetvalidation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(token),
      });

      if (res.status === 200) {
        const data = await res.json();
        setTempLogin(true, () => {
          navigate(`/resetpassword?username=${data.user}`);
        });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      navigate('/');
    }
  }

  // Initial validation effect
  useEffect(() => {
    validateToken();
  }, []);

  return <p>Validating reset token...</p>;
}
