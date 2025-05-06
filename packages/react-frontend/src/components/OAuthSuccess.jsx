import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const code = params.get('code');
    const verifier = localStorage.getItem('pkce_code_verifier');

    // Handle implicit grant flow (token in URL)
    if (accessToken) {
      localStorage.setItem('spotifyToken', accessToken);
      setIsLoggedIn?.(true);
      navigate('/dashboard', { replace: true });
      return;
    }

    // Handle authorization code flow + PKCE
    if (code && verifier) {
      (async () => {
        try {
          const response = await fetch(
            'https://accounts.spotify.com/api/token',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
                grant_type: 'authorization_code',
                code,
                redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
                code_verifier: verifier,
              }),
            }
          );
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.error || 'Token exchange failed');

          localStorage.setItem('spotifyToken', data.access_token);
          setIsLoggedIn?.(true);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('Token exchange error:', err);
          navigate('/login', { replace: true });
        }
      })();
    } else {
      console.error('No valid access token or code found');
      navigate('/login', { replace: true });
    }
  }, [navigate, setIsLoggedIn]);

  return (
    <div>
      <p>Authenticating with Spotify...</p>
    </div>
  );
};

export default OAuthSuccess;
