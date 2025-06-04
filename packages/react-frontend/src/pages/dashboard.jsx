import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/Dashboard.css';
import FavoriteGenreTile from '../components/FavoriteGenreTile';
const API_URL = import.meta.env.VITE_API_URL;
const PUBLIC_URL = import.meta.env.PUBLIC_URL;

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

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const Dashboard = () => {
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState({
    thisWeek: {
      timeSpent: 0,
      favoriteArtist: '',
      favoriteGenre: '',
    },
    lastWeek: {
      timeSpent: 0,
      favoriteArtist: '',
      favoriteGenre: '',
    },
    twoWeeksAgo: {
      timeSpent: 0,
      favoriteArtist: '',
      favoriteGenre: '',
    },
  });
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topAlbums, setTopAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [profilePic, setProfilePic] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlayed, setSelectedPlayed] = useState(null);
  const [chartData, setChartData] = useState([
    { name: '5 Weeks Ago', timeSpent: 0 },
    { name: '4 Weeks Ago', timeSpent: 0 },
    { name: '3 Weeks Ago', timeSpent: 0 },
    { name: '2 Weeks Ago', timeSpent: 0 },
    { name: 'Last Week', timeSpent: 0 },
    { name: 'This Week', timeSpent: 0 },
  ]);

  const handleConnectSpotify = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('pkce_code_verifier', verifier);

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative',
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
        const spotifyToken = localStorage.getItem('spotifyToken');
        if (!spotifyToken) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${spotifyToken}`,
          'x-username': localStorage.getItem('username'),
        };

        const profileRes = await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${spotifyToken}` },
        });

        setDisplayName(profileRes.data.display_name || 'Guest');
        setProfilePic(profileRes.data.images[0]?.url || '');

        const [tracksRes, artistsRes, recentRes, playlistsRes, albumsRes] =
          await Promise.all([
            axios.get(`${API_URL}/spotify/stats/top-tracks`, { headers }),
            axios.get(`${API_URL}/spotify/stats/top-artists`, { headers }),
            axios.get(`${API_URL}/spotify/stats/recently-played`, { headers }),
            axios.get(`${API_URL}/spotify/stats/playlists`, { headers }),
            axios.get(`${API_URL}/spotify/stats/top-albums`, { headers }),
          ]);

        setTopTracks(tracksRes.data.items);
        setTopArtists(artistsRes.data.items);
        setRecentlyPlayed(recentRes.data.items);
        setTopAlbums(albumsRes.data.items);
        setPlaylists(playlistsRes.data.items);
        setLoading(false);

        const totalMs = recentRes.data.items.reduce(
          (acc, item) => acc + item.track.duration_ms,
          0
        );
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        const formattedTime = `${hours}h ${minutes}m`;
        const historyRes = await axios.get(
          `${API_URL}/spotify/stats/listening-history`,
          { headers }
        );
        const history = historyRes.data;
        const now = new Date();
        const updatedChartData = [...chartData];

        for (const item of history) {
          const weekStart = new Date(item.weekStart);
          const diffWeeks = Math.floor(
            (now - weekStart) / (7 * 24 * 60 * 60 * 1000)
          );
          if (diffWeeks >= 0 && diffWeeks <= 5) {
            const hours = item.durationMs / 3600000;
            updatedChartData[5 - diffWeeks].timeSpent = hours;
          }
        }

        setChartData(updatedChartData);

        setUserStats((prev) => ({
          ...prev,
          thisWeek: {
            ...prev.thisWeek,
            timeSpent: formattedTime,
            favoriteArtist: artistsRes.data.items[0]?.name || 'No data',
            favoriteGenre:
              artistsRes.data.items.find((artist) => artist.genres.length > 0)
                ?.genres[0] || 'No data',
          },
        }));
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('spotifyToken');
          setError(
            'Your Spotify session has expired. Please reconnect your account.'
          );
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatYAxis = (value) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const value = payload[0].value;
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          <p className="value">{`Time: ${hours}h ${minutes}m`}</p>
        </div>
      );
    }
    return null;
  };

  const genreData = topArtists
    .filter((artist) => artist.genres.length > 0)
    .slice(0, 4)
    .map((artist) => ({
      name: artist.genres[0],
      value: artist.popularity,
    }));

  const COLORS = ['#30e849', '#8884d8', '#82ca9d', '#ff8042'];
  const [user, setUser] = useState('');
  const getPopularityBadge = (popularity) => {
    if (popularity >= 81) return '🔥 Superstar';
    if (popularity >= 61) return '🌟 Popular';
    if (popularity >= 41) return '🌱 Emerging';
    return '🌑 Indie';
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    console.log('Loaded user from localStorage:', storedUser);
    if (storedUser) setUser(storedUser);
  }, []);

  const spotifyToken = localStorage.getItem('spotifyToken');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your music data...</p>
      </div>
    );
  }

  if (!spotifyToken) {
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
      {selectedTrack && (
        <div
          className="track-modal-overlay"
          onClick={() => setSelectedTrack(null)}
        >
          <div className="track-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedTrack(null)}
            >
              X
            </button>
            <img
              src={selectedTrack.album?.images[0]?.url}
              alt={selectedTrack.name}
              className="track-modal-image"
            />
            <h2>{selectedTrack.name}</h2>
            <p>
              Artists: {selectedTrack.artists.map((a) => a.name).join(', ')}
            </p>
            <p>Album: {selectedTrack.album?.name}</p>
            <p>Release Date: {selectedTrack.album?.release_date}</p>
            <a
              href={selectedTrack.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Spotify
            </a>
          </div>
        </div>
      )}
      {selectedArtist && (
        <div
          className="track-modal-overlay"
          onClick={() => setSelectedArtist(null)}
        >
          <div className="track-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedArtist(null)}
            >
              X
            </button>
            {/* If your artist object has an image, replace the src below accordingly */}
            <img
              src={selectedArtist.images?.[0]?.url}
              alt={selectedArtist.name}
              className="track-modal-image"
            />
            <h2>{selectedArtist.name}</h2>
            {/* Example: show artist’s genres */}
            <p>Genres: {selectedArtist.genres?.join(', ')}</p>
            <p>Popularity: {selectedArtist.popularity}</p>
          </div>
        </div>
      )}

      {selectedAlbum && (
        <div
          className="track-modal-overlay"
          onClick={() => setSelectedAlbum(null)}
        >
          <div className="track-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedAlbum(null)}
            >
              X
            </button>
            <img
              src={selectedAlbum.image}
              alt={selectedAlbum.name}
              className="track-modal-image"
            />
            <h2>{selectedAlbum.name}</h2>
            <p>Artists: {selectedAlbum.artists}</p>
            <p>Released: {selectedAlbum.release_date}</p>
            <p>Label: {selectedAlbum.label}</p>
          </div>
        </div>
      )}

      {selectedPlayed && (
        <div
          className="track-modal-overlay"
          onClick={() => setSelectedPlayed(null)}
        >
          <div className="track-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedPlayed(null)}
            >
              X
            </button>
            <img
              src={selectedPlayed.album?.images[0]?.url}
              alt={selectedPlayed.name}
              className="track-modal-image"
            />
            <h2>{selectedPlayed.name}</h2>
            <p>
              Artists: {selectedPlayed.artists.map((a) => a.name).join(', ')}
            </p>
            <p>Album: {selectedPlayed.album?.name}</p>
            <p>
              Played At: {new Date(selectedPlayed.played_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {selectedPlaylist && (
        <div
          className="track-modal-overlay"
          onClick={() => setSelectedPlaylist(null)}
        >
          <div className="track-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedPlaylist(null)}
            >
              X
            </button>
            <img
              src={selectedPlaylist.images?.[0]?.url}
              alt={selectedPlaylist.name}
              className="track-modal-image"
            />
            <h2>{selectedPlaylist.name}</h2>
            <p>Total Tracks: {selectedPlaylist.tracks.total}</p>
            <p>Description: {selectedPlaylist.description || 'N/A'}</p>
          </div>
        </div>
      )}
      <div className="dashboard-content">
        <h1>Welcome back, {displayName || 'Guest'}</h1>
        {profilePic && (
          <img src={profilePic} alt="Profile" className="profile-picture" />
        )}
        <h1>Your Music Dashboard</h1>
        <h5>Gain insights into your listening habits and discover trends.</h5>
      </div>
      <div className="sections-container">
        {/* Top Tracks Section */}
        <section className="top-tracks">
          <h2>Your Top Tracks</h2>
          <div className="music-grid">
            {topTracks.slice(0, 5).map((track, index) => (
              <div
                key={`${track.id}-top-${index}`}
                className="music-item"
                onClick={() => {
                  console.log('clicked track:', track.name);
                  setSelectedTrack(track);
                }}
                style={{ cursor: 'pointer' }}
              >
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

        <section className="favorite-genre-section">
          <h2>Your Favorite Genre</h2>
          <FavoriteGenreTile genre={userStats.thisWeek.favoriteGenre} />
        </section>

        {/* Top Artists Section */}
        <section className="top-artists">
          <h2>Your Top Artists</h2>
          <div className="music-grid">
            {topArtists.slice(0, 5).map((artist) => (
              <div
                key={artist.id}
                className="music-item"
                onClick={() => {
                  console.log('clicked artist:', artist.name);
                  setSelectedArtist(artist);
                }}
              >
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="music-image"
                />
                <div className="music-info">
                  <h3>{artist.name}</h3>
                  <p>{artist.genres.slice(0, 2).join(', ')}</p>
                  <p>
                    {getPopularityBadge(artist.popularity)} ({artist.popularity}
                    /100)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="top-albums">
          <h2>Your Favorite Albums</h2>
          <div className="music-grid">
            {topAlbums.map((album) => (
              <div
                key={album.id}
                className="music-item"
                onClick={() => {
                  console.log('clicked album:', album.name);
                  setSelectedAlbum(album);
                }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={album.image}
                  alt={album.name}
                  className="music-image"
                />
                {/* Note: this is probably stuff we want to hide in a dropdown/ onclick but ill leave it here for now */}
                <div className="music-info">
                  <h3>{album.name}</h3>
                  <p>{album.artists}</p>
                  <p>Released: {album.release_date}</p>
                  <p>
                    {getPopularityBadge(album.popularity)} ({album.popularity}
                    /100)
                  </p>
                  <p>Label: {album.label}</p>
                  <a href={album.url} target="_blank" rel="noopener noreferrer">
                    Listen on Spotify
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played Section */}
        <section className="recently-played">
          <h2>Recently Played</h2>
          <div className="music-grid">
            {recentlyPlayed.slice(0, 5).map((item, index) => (
              <div
                key={`${item.track.id}-${index}`}
                className="music-item"
                onClick={() => {
                  console.log('clicked recently played:', item.track.name);
                  setSelectedPlayed(item.track);
                }}
                style={{ cursor: 'pointer' }}
              >
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

        {/* Top Playlists Section */}
        <section className="top-playlists">
          <h2>Your Playlists</h2>
          <div className="music-grid">
            {playlists.slice(0, 5).map((playlist) => (
              <div
                key={playlist.id}
                className="music-item"
                onClick={() => {
                  console.log('clicked playlist:', playlist.name);
                  setSelectedPlaylist(playlist);
                }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={playlist.images?.[0]?.url || PUBLIC_URL + '/pfp.png'}
                  alt={playlist.name}
                  className="music-image"
                />
                <div className="music-info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.tracks.total} tracks</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Charts */}
        <div className="chart-container">
          <h2>Listening Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="timeSpent" fill="#30e849" name="Time Listened" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Top Genres</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {genreData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
