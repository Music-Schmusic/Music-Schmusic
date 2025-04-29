import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Store Spotify token
      localStorage.setItem('spotifyToken', accessToken);
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
