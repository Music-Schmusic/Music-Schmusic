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

const Dashboard = () => {
  console.log('Dashboard component rendered'); // Debug log

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
  const [authUrl, setAuthUrl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log('Fetching auth URL...'); // Debug log
    const fetchAuthUrl = async () => {
      try {
        const response = await axios.get('http://localhost:8000/authorize');
        console.log('Auth URL received:', response.data.authUrl); // Debug log
        setAuthUrl(response.data.authUrl);
      } catch (err) {
        console.error('Error fetching auth URL:', err);
        setError('Failed to get Spotify authorization URL');
      }
    };

    fetchAuthUrl();
  }, []);

  useEffect(() => {
    console.log('Fetching data...'); // Debug log
    const fetchData = async () => {
      try {
        const spotifyToken = localStorage.getItem('spotifyToken');
        console.log('Spotify token found:', !!spotifyToken); // Debug log

        if (!spotifyToken) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${spotifyToken}`,
        };

        console.log('Making API requests...'); // Debug log
        const [tracksResponse, artistsResponse, recentResponse] =
          await Promise.all([
            axios.get('http://localhost:8000/spotify/top-tracks', { headers }),
            axios.get('http://localhost:8000/spotify/top-artists', { headers }),
            axios.get('http://localhost:8000/spotify/recently-played', {
              headers,
            }),
          ]);

        console.log('API responses received'); // Debug log
        setTopTracks(tracksResponse.data);
        setTopArtists(artistsResponse.data);
        setRecentlyPlayed(recentResponse.data);
        setLoading(false);

        // Calculate time spent listening
        const timeSpent =
          recentResponse.data.reduce(
            (acc, track) => acc + track.track.duration_ms,
            0
          ) / 3600000; // Convert to hours
        setUserStats((prev) => ({
          ...prev,
          thisWeek: {
            ...prev.thisWeek,
            timeSpent: timeSpent,
            favoriteArtist: artistsResponse.data[0]?.name || 'No data',
            favoriteGenre: artistsResponse.data[0]?.genres[0] || 'No data',
          },
        }));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format data for charts
  const chartData = [
    { name: '5 Weeks Ago', timeSpent: userStats.twoWeeksAgo.timeSpent },
    { name: '4 Weeks Ago', timeSpent: userStats.lastWeek.timeSpent },
    { name: '3 Weeks Ago', timeSpent: userStats.thisWeek.timeSpent },
    { name: '2 Weeks Ago', timeSpent: userStats.twoWeeksAgo.timeSpent },
    { name: 'Last Week', timeSpent: userStats.lastWeek.timeSpent },
    { name: 'This Week', timeSpent: userStats.thisWeek.timeSpent },
  ];

  const genreData = topArtists.slice(0, 4).map((artist) => ({
    name: artist.genres[0] || 'Unknown',
    value: artist.popularity,
  }));

  const COLORS = ['#30e849', '#8884d8', '#82ca9d', '#ff8042'];

  const user = localStorage.getItem('username');
  const spotifyToken = localStorage.getItem('spotifyToken');

  console.log('Rendering state:', { loading, error, spotifyToken }); // Debug log

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
        {authUrl && (
          <button
            onClick={() => window.open(authUrl, '_self')}
            className="connect-spotify-button"
          >
            Connect Spotify
          </button>
        )}
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

        <div className="chart-container">
          <h2>Listening Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="timeSpent" fill="#30e849" name="Hours Listened" />
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
