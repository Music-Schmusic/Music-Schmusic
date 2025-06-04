import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './recs.css';

const API_URL = import.meta.env.VITE_API_URL;
const Recommended = () => {
  // state for AI cover
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  state for playlist recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  // AI cover fetch function
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

  const handleRemove = (index) => {
    setRecommends((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRespin = async (index) => {
    setLoadingSongIndexes((prev) => [...prev, index]);
    try {
      const spotifyToken = localStorage.getItem('spotifyToken');
      const headers = {
        Authorization: `Bearer ${spotifyToken}`,
        'x-username': localStorage.getItem('username'),
      };

      const response = await axios.get(`${API_URL}/spotify/recommend`, {
        headers,
      });

      const newTrack =
        response.data[Math.floor(Math.random() * response.data.length)];

      setRecommends((prev) =>
        prev.map((item, i) => (i === index ? newTrack : item))
      );
    } catch (err) {
      console.error('Failed to respin:', err);
    } finally {
      setLoadingSongIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  // Function to fetch playlist recommendations (static for now)
  const getRecommendations = () => {
    setRecLoading(true);
    setRecError(null);
    try {
      // Static sample data
      const staticRecs = [
        {
          title: 'Rock Anthem',
          artist: 'Band A',
          spotifyUrl: 'https://open.spotify.com/track/trackId1',
        },
        {
          title: 'Hip Hop Beat',
          artist: 'Artist B',
          spotifyUrl: 'https://open.spotify.com/track/trackId2',
        },
        {
          title: 'Metal Riff',
          artist: 'Group C',
          spotifyUrl: 'https://open.spotify.com/track/trackId3',
        },
      ];
      setRecommendations(staticRecs);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecError('Failed to load recommendations.');
    } finally {
      setRecLoading(false);
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
          <div className="song-grid">
            {isFetchingSongs ? (
              <div className="mini-spinner-container">
                <div className="loading-spinner" />
                <p>Loading recommendations...</p>
              </div>
            ) : (
              recommends.map((item, index) => (
                <div key={item.id || index} className="song-card">
                  {loadingSongIndexes.includes(index) ? (
                    <div className="loading-spinner song-spinner" />
                  ) : (
                    <>
                      <div className="song-details">
                        <h3>{item.name}</h3>
                        <p>{item.artist}</p>
                        <div className="song-actions">
                          <button
                            className="remove"
                            onClick={() => handleRemove(index)}
                          >
                            Remove
                          </button>
                          <button
                            className="respin"
                            onClick={() => handleRespin(index)}
                          >
                            Respin
                          </button>
                        </div>
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="song-cover"
                      />
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Center: AI Playlist Cover */}
        <section className="generate-playlist">
          <h2>Generate Playlist</h2>
          <button onClick={getAICover} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Playlist Cover'}
          </button>

          <div className="playlist-box" style={{ marginTop: '10px' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading ? <div className="loading-spinner song-spinner" /> : ''}
            {coverImage && !loading ? (
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

        {/* New Column: Generated Recommendations */}
        <section
          className="playlist-recommendations"
          style={{ padding: '0 20px' }}
        >
          <h2>Generated Playlist</h2>
          <button onClick={getRecommendations} disabled={recLoading}>
            {recLoading ? 'Loading...' : 'Get Recommendations'}
          </button>

          <div style={{ marginTop: '10px' }}>
            {recError && <p style={{ color: 'red' }}>{recError}</p>}
            {recommendations.length > 0 ? (
              <ul>
                {recommendations.map((song, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong>{song.title}</strong> — {song.artist}{' '}
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Listen
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              !recLoading && <span style={{ fontSize: '2rem' }}>?</span>
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
