import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccountRecovery() {
  const [credentials, setcredentials] = useState({
    username: '',
    email: '',
  });
  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'username')
      setcredentials({
        username: value,
        email: credentials['email'],
      });
    else if (name === 'email')
      setcredentials({
        username: credentials['username'],
        email: value,
      });
  }

  function recoverAccount(credentials) {
    return fetch('http://localhost:8000/accountrecovery', {
      method: 'Post',
      headers: { 'Content-Type': 'application/json' },
      body: credentials,
    });
  }

  function handleSubmit(credentials) {
    recoverAccount(credentials)
      .then((res) => {
        if (res.status === 200) {
          return res.text();
        } else if (res.status === 404) {
          return res.text();
        } else if (res.status === 401) {
          return res.text();
        }
      })
      .then((text) => {
        if (text) window.alert(text);
      })
      .catch(console.error);
  }

  function submitForm() {
    handleSubmit(credentials);
    setcredentials({
      username: '',
      email: '',
    });
  }

  return (
    <form className="accountrecovery-form">
      <label htmlFor="username">Username</label>
      <input
        type="text"
        name="username"
        id="username"
        value={credentials.username}
        onChange={handleChange}
        required
      />
      <label htmlFor="email">Email</label>
      <input
        type="email"
        name="email"
        id="email"
        value={credentials.email}
        onChange={handleChange}
        required
      />
      <input type="button" value="Submit" onClick={submitForm} />
    </form>
  );
}
