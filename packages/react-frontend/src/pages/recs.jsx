import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const Recommended = () => {
  // 1. Create local state for the cover image
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommends, setRecommends] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const spotifyToken = localStorage.getItem('spotifyToken');
        if (!spotifyToken) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${spotifyToken}`,
          'x-username': localStorage.getItem('username'),
        };

        const recommendedSongs = await axios.get(
          `${API_URL}/spotify/recommend`,
          { headers }
        );

        setRecommends(recommendedSongs.data);
        console.log(recommends);
        console.log('^ recommends');
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  // 2. Create the same AI cover fetch function
  const getAICover = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/playlist-cover/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user' }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('AI Cover Response:', data);
      setCoverImage(data.image);
    } catch (err) {
      console.error('Error fetching AI cover:', err);
      setError('Failed to generate cover.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommended-container">
      <header className="header">
        <h1>Recommended Music</h1>
      </header>

      <main className="main-content">
        {/* Left Column: Recommended Songs */}
        <section className="recommended-songs">
          <h2>Recommended Songs</h2>
          <ul>
            {recommends.map((item, index) => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.name + ' | ' + item.artist}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Center: AI Playlist Cover */}
        <section className="generate-playlist">
          <h2>Generate Playlist</h2>
          <button onClick={getAICover} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Playlist Cover'}
          </button>

          <div className="playlist-box" style={{ marginTop: '10px' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {coverImage ? (
              <img
                src={coverImage}
                alt="AI Generated Playlist Cover"
                style={{
                  maxWidth: '200px',
                  border: '2px solid #fff',
                  borderRadius: '4px',
                }}
              />
            ) : (
              !loading && <span style={{ fontSize: '2rem' }}>?</span>
            )}
          </div>
        </section>

        {/* Right Column: Find New Artists */}
        <section className="new-artists">
          <h2>Find New Artists</h2>
          <ul>
            <li>Artist Name 1</li>
            <li>Artist Name 2</li>
            <li>Artist Name 3</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Recommended;
