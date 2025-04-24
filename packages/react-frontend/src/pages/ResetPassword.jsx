import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccountRecovery() {
  const [password, setPassword] = useState({
    password: '',
  });
  const navigate = useNavigate();
  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'password')
      setPassword({
        password: value,
      });
  }

  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const token = {
    token: urlParams.get('token'),
  };

  //Validate credentials
  fetch('http://localhost:8000/resetvalidation', {
    method: 'Post',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(token),
  })
    .then((res) => {
      if (res.status === 200) {
        console.log(sucess);
      } else {
        navigate('/');
        return res.text();
      }
    })
    .then((text) => {
      console.log(text);
    })
    .catch(console.error);

  return <p>YAY</p>;
}
