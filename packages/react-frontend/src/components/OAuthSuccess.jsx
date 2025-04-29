import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Store token (in memory, localStorage, cookie, etc)
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      navigate('/dashboard');
    } else {
      console.error('No access token found');
      navigate('/login');
    }
  }, [navigate, setIsLoggedIn]);

  return (
    <div>
      <p>Authenticating with Spotify...</p>
    </div>
  );
};

export default OAuthSuccess;
