import React, { useState } from 'react';
import fetch from 'node-fetch';

const Recommended = () => {
  // 1. Create local state for the cover image
  const [coverImage, setCoverImage] = useState(null);

  // 2. Create the same AI cover fetch function
  const getAICover = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/playlist-cover/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user' }),
        }
      );
      const data = await response.json();
      console.log('API Response:', data);
      setCoverImage(data.image);
      console.log('Cover Image URL:', data.image);
    } catch (error) {
      console.error('Error fetching AI cover:', error);
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
            <li>Song Title 1</li>
            <li>Song Title 2</li>
            <li>Song Title 3</li>
          </ul>
        </section>

        {/* Center Column: Generate Playlist */}
        <section className="generate-playlist">
          <h2>Generate Playlist</h2>

          {/* 3. Add a button to trigger the AI cover fetch */}
          <button onClick={getAICover} style={{ marginBottom: '10px' }}>
            Generate Playlist Cover
          </button>

          {/* 4. Display the AI cover if available, otherwise show “?” */}
          <div className="playlist-box" style={{ position: 'relative' }}>
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
              <span style={{ fontSize: '2rem' }}>?</span>
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
