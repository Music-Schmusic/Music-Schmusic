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
const API_URL = import.meta.env.VITE_API_URL;

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

        const headers = { Authorization: `Bearer ${spotifyToken}` };
        const [tracksRes, artistsRes, recentRes] = await Promise.all([
          axios.get(`${API_URL}/spotify/stats/top-tracks`, {
            headers,
          }),
          axios.get(`${API_URL}/spotify/stats/top-artists`, {
            headers,
          }),
          axios.get(`${API_URL}/spotify/stats/recently-played`, {
            headers,
          }),
        ]);

        setTopTracks(tracksRes.data.items);
        setTopArtists(artistsRes.data.items);
        setRecentlyPlayed(recentRes.data.items);
        setLoading(false);

        const totalMs = recentRes.data.items.reduce(
          (acc, item) => acc + item.track.duration_ms,
          0
        );
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        const formattedTime = `${hours}h ${minutes}m`;

        setUserStats((prev) => ({
          ...prev,
          thisWeek: {
            ...prev.thisWeek,
            timeSpent: formattedTime,
            favoriteArtist: artistsRes.data.items[0]?.name || 'No data',
            favoriteGenre: artistsRes.data.items[0]?.genres[0] || 'No data',
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

  useEffect(() => {
    if (userStats.thisWeek.timeSpent) {
      const [hours, minutes] = userStats.thisWeek.timeSpent
        .split(' ')
        .map((str) => parseInt(str));
      const totalHours = hours + minutes / 60;

      setChartData((prev) => {
        const updated = [...prev];
        updated[5] = { ...updated[5], timeSpent: totalHours };
        return updated;
      });
    }
  }, [userStats]);

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

  const genreData = topArtists.slice(0, 4).map((artist) => ({
    name: artist.genres[0] || 'Unknown',
    value: artist.popularity,
  }));

  const COLORS = ['#30e849', '#8884d8', '#82ca9d', '#ff8042'];
  const user = localStorage.getItem('username');
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
      <div className="dashboard-content">
        <h1>Welcome back, {user}</h1>
        <h1>Your Music Dashboard</h1>
        <h5>Gain insights into your listening habits and discover trends.</h5>
      </div>

      <div className="sections-container">
        {/* Top Tracks Section */}
        <section className="top-tracks">
          <h2>Your Top Tracks</h2>
          <div className="music-grid">
            {topTracks.slice(0, 5).map((track) => (
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

        {/* Top Artists Section */}
        <section className="top-artists">
          <h2>Your Top Artists</h2>
          <div className="music-grid">
            {topArtists.slice(0, 5).map((artist) => (
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

        {/* Recently Played Section */}
        <section className="recently-played">
          <h2>Recently Played</h2>
          <div className="music-grid">
            {recentlyPlayed.slice(0, 5).map((item) => (
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
