import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function Form(props) {
  const navigate = useNavigate();

  const [account, setAccount] = useState({
    username: '',
    email: '',
    password: '',
    following: [],
    blocked: [],
    privacyStatus: 'Private',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'username')
      setAccount({
        username: value,
        email: account['email'],
        password: account['password'],
        following: account['following'],
        blocked: account['blocked'],
        privacyStatus: 'Private',
      });
    else if (name === 'email')
      setAccount({
        username: account['username'],
        email: value,
        password: account['password'],
        following: account['following'],
        blocked: account['blocked'],
        privacyStatus: 'Private',
      });
    else
      setAccount({
        username: account['username'],
        email: account['email'],
        password: value,
        following: account['following'],
        blocked: account['blocked'],
        privacyStatus: 'Private',
      });
  }

  function submitForm() {
    props.handleSubmit(account);
    setAccount({
      username: '',
      email: '',
      password: '',
      following: [],
      blocked: [],
      privacyStatus: 'Private',
    });
  }
  return (
    <form>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        name="username"
        id="username"
        value={account.username}
        onChange={handleChange}
        required
      />
      <label htmlFor="email">Email</label>
      <input
        type="email"
        name="email"
        id="email"
        value={account.email}
        onChange={handleChange}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        name="password"
        id="password"
        value={account.password}
        onChange={handleChange}
        required
      />

      <input type="button" value="Submit" onClick={submitForm} />
    </form>
  );
}
export default Form;
