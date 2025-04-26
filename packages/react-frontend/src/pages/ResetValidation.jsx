import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetValidation({ tempLogin, setTempLogin }) {
  const navigate = useNavigate();
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const token = {
    token: urlParams.get('token'),
  };

  const [user, setUser] = useState('');

  // Fetch the validation token and set tempLogin state
  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch('http://localhost:8000/resetvalidation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(token),
        });

        if (res.status === 200) {
          console.log('success');
          setTempLogin(true);
          const data = await res.json();
          if (data && data.user) {
            console.log(data.user);
            setUser(data.user);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error(error);
      }
    };

    validateToken();
  }, []);

  // Navigate once tempLogin is true and user is set
  useEffect(() => {
    if (tempLogin && user) {
      navigate(`/resetpassword?user=${user}`);
    }
  }, [tempLogin, user, navigate]);

  return <p>Validating reset token...</p>;
}
