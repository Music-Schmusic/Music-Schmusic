import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './recs.css';

const API_URL = import.meta.env.VITE_API_URL;
const Recommended = () => {
  // 1. Create local state for the cover image
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommends, setRecommends] = useState([]);
  const [isFetchingSongs, setIsFetchingSongs] = useState(true);
  const [loadingSongIndexes, setLoadingSongIndexes] = useState([]);

  const [topArtists, setTopArtists] = useState([]);
  const [artistRecs, setArtistRecs] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const genresReady = topArtists.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const spotifyToken = localStorage.getItem('spotifyToken');
        if (!spotifyToken) {
          setIsFetchingSongs(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${spotifyToken}`,
          'x-username': localStorage.getItem('username'),
        };

        const [recommendedSongs, artistRes] = await Promise.all([
          axios.get(`${API_URL}/spotify/recommend`, { headers }),
          axios.get(`${API_URL}/spotify/stats/top-artists`, { headers }),
        ]);

        setRecommends(recommendedSongs.data);
        setTopArtists(artistRes.data.items);
      } catch (error) {
        console.log(error);
      } finally {
        setIsFetchingSongs(false);
      }
    };
    fetchData();
  }, []);

  // === Fetch Artist Recommendations using Gemini ===
  const getArtistRecs = async () => {
    if (!genreData.length) return;
    setLoadingArtists(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/playlist-recommendations/generate`,
        {
          genres: genreData,
        }
      );
      setArtistRecs(res.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching artist recs:', err);
    } finally {
      setLoadingArtists(false);
    }
  };

  const getAICover = async () => {
    setLoading(true);
    setError(null);

    // Build genreData dynamically when the button is clicked
    const genreSet = new Set();
    topArtists.forEach((artist) => {
      artist.genres.forEach((genre) => {
        if (genreSet.size < 5) genreSet.add(genre);
      });
    });
    const genreData = Array.from(genreSet);

    // Prevent invalid API call
    if (genreData.length === 0) {
      setError('Genres are still loading. Try again in a few seconds.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/playlist-cover/generate`, {
        genres: genreData,
      });
      setCoverImage(res.data.image);
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

  return (
    <div className="recommended-container">
      <header className="header">
        <h1>Your Personalized Picks</h1>
        <h4>Your Next Favorite Tracks, Curated from Your Listening Habits</h4>
        <h5>
          Discover new music tailored to your taste, with AI-generated playlist
          covers and artist recommendations.
        </h5>
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
                            className="listen"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            Listen
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
          <h2>Generate Playlist Cover</h2>
          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <button onClick={getAICover} disabled={loading || !genresReady}>
              {loading ? 'Generating...' : 'Generate Playlist Cover'}
            </button>
          </div>
          <div className="playlist-box" style={{ marginTop: '30px' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading ? <div className="loading-spinner song-spinner" /> : ''}
            {coverImage && !loading ? (
              <div className="cover-image-container">
                <img
                  src={coverImage}
                  alt="AI Generated Playlist Cover"
                  style={{
                    maxWidth: '250px',
                    border: '10px solid #fff',
                    borderRadius: '4px',
                  }}
                />
                <br />
                <a
                  href={coverImage}
                  download="playlist-cover.jpg"
                  className="download-cover-btn"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '40px',
                    padding: '8px 16px',
                    background: '#1db954',
                    color: '#fff',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  Download Cover Image
                </a>
              </div>
            ) : (
              !loading && <span style={{ fontSize: '2rem' }}>?</span>
            )}
          </div>
        </section>

        {/* Right Column: Find New Artists */}
        <section className="new-artists">
          <h2>Find New Artists</h2>
          <button onClick={getArtistRecs} disabled={loadingArtists}>
            {loadingArtists ? 'Loading...' : 'Generate Artist Recommendations'}
          </button>

          {loadingArtists ? (
            <div className="loading-spinner" />
          ) : (
            <div className="artist-rec-grid">
              {artistRecs.map((artistObj, idx) => (
                <div key={idx} className="artist-block">
                  <h3>{artistObj.artist}</h3>
                  <ul>
                    {artistObj.songs.map((song, i) => (
                      <li key={i}>
                        <span>{song.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Recommended;
