import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function resetPassword({ tempLogin, setTempLogin }) {
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const user = urlParams.get('user');
  const navigate = useNavigate();
  const [data, setData] = useState({
    p1: '',
    p2: '',
    user: user,
  });
  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'password')
      setData({
        p1: value,
        p2: data['p2'],
        user: data['user'],
      });
    else if (name === 'confirmPassword')
      setData({
        p1: data['p1'],
        p2: value,
        user: data['user'],
      });
  }

  function resetpassword(data) {
    return fetch('http://localhost:8000/resetpassword', {
      method: 'Post',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  }

  function handleSubmit(data) {
    resetpassword(data)
      .then((res) => {
        if (res.status === 200) {
          return res.text();
        } else {
          return res.text();
        }
      })
      .then((text) => {
        if (text) window.alert(text);
      })
      .catch(console.error);
  }

  async function submitForm() {
    await handleSubmit(data);
    setData({
      p1: '',
      p2: '',
      user: user,
    });
    navigate('/login');
  }

  return (
    <form className="resetpassword-form">
      <label htmlFor="Password">Enter new password</label>
      <input
        type="password"
        name="password"
        id="password"
        value={data.p1}
        onChange={handleChange}
        required
      />
      <label htmlFor="Password">Confirm new password</label>
      <input
        type="password"
        name="confirmPassword"
        id="confirmpassword"
        value={data.p2}
        onChange={handleChange}
        required
      />
      <input type="button" value="Submit" onClick={submitForm} />
    </form>
  );
}
