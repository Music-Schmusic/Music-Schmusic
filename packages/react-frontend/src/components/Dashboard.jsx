import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

// PKCE helper functions
function generateCodeVerifier(length = 128) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const Dashboard = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = localStorage.getItem('username');
  const spotifyToken = localStorage.getItem('spotifyToken');

  // PKCE-based redirect to Spotify
  const handleConnectSpotify = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('pkce_code_verifier', verifier);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
    ];

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scopes.join(' ')
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code_challenge_method=S256&code_challenge=${challenge}`;

    window.location.href = authUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!spotifyToken) {
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${spotifyToken}` };

        const [tracksRes, artistsRes, recentRes] = await Promise.all([
          axios.get('http://localhost:8000/spotify/stats/top-tracks', {
            headers,
          }),
          axios.get('http://localhost:8000/spotify/stats/top-artists', {
            headers,
          }),
          axios.get('http://localhost:8000/spotify/stats/recently-played', {
            headers,
          }),
        ]);

        setTopTracks(tracksRes.data);
        setTopArtists(artistsRes.data);
        setRecentlyPlayed(recentRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [spotifyToken]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your music data...</p>
      </div>
    );
  }

  if (error || !spotifyToken) {
    return (
      <div className="connect-spotify-container">
        <h2>Connect Your Spotify Account</h2>
        <p>To view your music data, please connect your Spotify account.</p>
        <button
          onClick={handleConnectSpotify}
          className="connect-spotify-button"
        >
          Connect Spotify
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <h1>Welcome back, {username}!</h1>
        <h5>Here's your personalized music dashboard</h5>
      </div>

      <div className="sections-container">
        <section className="top-tracks">
          <h2>Your Top Tracks</h2>
          <div className="music-grid">
            {topTracks.map((track) => (
              <div key={track.id} className="music-item">
                <img
                  src={track.album?.images[0]?.url}
                  alt={track.name}
                  className="music-image"
                />
                <div className="music-info">
                  <h3>{track.name}</h3>
                  <p>{track.artists.map((a) => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="top-artists">
          <h2>Your Top Artists</h2>
          <div className="music-grid">
            {topArtists.map((artist) => (
              <div key={artist.id} className="music-item">
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="music-image"
                />
                <div className="music-info">
                  <h3>{artist.name}</h3>
                  <p>{artist.genres.slice(0, 2).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="recently-played">
          <h2>Recently Played</h2>
          <div className="music-grid">
            {recentlyPlayed.map((item) => (
              <div key={item.track.id} className="music-item">
                <img
                  src={item.track.album?.images[0]?.url}
                  alt={item.track.name}
                  className="music-image"
                />
                <div className="music-info">
                  <h3>{item.track.name}</h3>
                  <p>{item.track.artists.map((a) => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
