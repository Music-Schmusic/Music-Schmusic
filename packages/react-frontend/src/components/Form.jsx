import React, { useState } from 'react';
import {
  useNavigate,
} from 'react-router-dom';
function Form(props) {
  const navigate = useNavigate()
  
  const [account, setAccount] = useState({
    spotifyId : '',
    spotifySecret : '',
    username : '',
    email : '',
    password : '',
    following : [],
    blocked : [],
  })

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === 'spotifyId') setAccount(
      { 
        spotifyId: value,
        spotifySecret : account['spotifySecret'],
        username : account['username'],
        email : account['email'],
        password : account['password'],
        following : account['following'],
        blocked : account['blocked'],
      });
    else if (name === 'spotifySecret') setAccount(
      { 
        spotifyId: account['spotifyId'],
        spotifySecret : value,
        username : account['username'],
        email : account['email'],
        password : account['password'],
        following : account['following'],
        blocked : account['blocked'],
      });
      else if (name === 'username') setAccount(
      { 
        spotifyId: account['spotifyId'],
        spotifySecret : account['spotifySecret'],
        username : value,
        email : account['email'],
        password : account['password'],
        following : account['following'],
        blocked : account['blocked'],
      });
      else if (name === 'email') setAccount(
      { 
        spotifyId: account['spotifyId'],
        spotifySecret : account['spotifySecret'],
        username : account['username'],
        email : value,
        password : account['password'],
        following : account['following'],
        blocked : account['blocked'],
      });
      else setAccount(
      { 
        spotifyId: account['spotifyId'],
        spotifySecret : account['spotifySecret'],
        username : account['username'],
        email : account['email'],
        password : value,
        following : account['following'],
        blocked : account['blocked'],
      });

  }

  function submitForm() {
    props.handleSubmit(account);
    setAccount(
      {
        spotifyId : '',
        spotifySecret : '',
        username : '',
        email : '',
        password : '',
        following : [],
        blocked : []
      }
    );
    navigate('/login');
  }
  return (
    <form>
      <label htmlFor="spotifyId">Spotify Id</label>
      <input
        type="text"
        name="spotifyId"
        id="spotifyId"
        value={account.name}
        onChange={handleChange}
        required
      />
      <label htmlFor="spotifySecret">Spotify Secret</label>
      <input
        type="password"
        name="spotifySecret"
        id="spotifySecret"
        value={account.spotifySecret}
        onChange={handleChange}
        required
      />
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
