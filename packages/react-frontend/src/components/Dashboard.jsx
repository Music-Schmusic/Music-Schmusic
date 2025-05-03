import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const spotifyToken = localStorage.getItem('spotifyToken');
        if (!spotifyToken) {
          throw new Error('No Spotify token found');
        }

        const headers = {
          Authorization: `Bearer ${spotifyToken}`,
        };

        const [tracksResponse, artistsResponse, recentResponse] =
          await Promise.all([
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

        setTopTracks(tracksResponse.data);
        setTopArtists(artistsResponse.data);
        setRecentlyPlayed(recentResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your music data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="try-again-button"
        >
          Try Again
        </button>
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
                  <p>{track.artists.map((artist) => artist.name).join(', ')}</p>
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
                  <p>
                    {item.track.artists.map((artist) => artist.name).join(', ')}
                  </p>
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
