import React, { useState } from 'react';
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
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Dashboard() {
  // Sample data structure for time spent

  const [userStats, setUserStats] = useState({
    thisWeek: {
      timeSpent: 12,
      favoriteArtist: 'Taylor Swift',
      favoriteGenre: 'Pop',
    },
    lastWeek: {
      timeSpent: 10,
      favoriteArtist: 'Drake',
      favoriteGenre: 'Hip-Hop',
    },
    twoWeeksAgo: {
      timeSpent: 8,
      favoriteArtist: 'The Weeknd',
      favoriteGenre: 'R&B',
    },
  });

  // New state for the AI-generated playlist cover
  const [coverImage, setCoverImage] = useState(null);

  // Function to fetch the AI-generated cover from your backend
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

  // Format data for Recharts
  const chartData = [
    { name: '5 Weeks Ago', timeSpent: userStats.twoWeeksAgo.timeSpent },
    { name: '4 Weeks Ago', timeSpent: userStats.lastWeek.timeSpent },
    { name: '3 Weeks Ago', timeSpent: userStats.thisWeek.timeSpent },
    { name: '2 Weeks Ago', timeSpent: userStats.twoWeeksAgo.timeSpent },
    { name: 'Last Week', timeSpent: userStats.lastWeek.timeSpent },
    { name: 'This Week', timeSpent: userStats.thisWeek.timeSpent },
  ];

  const genreData = [
    { name: 'Pop', value: 50 },
    { name: 'Hip-Hop', value: 25 },
    { name: 'R&B', value: 15 },
    { name: 'Rock', value: 10 },
  ];
  const COLORS = ['#30e849', '#8884d8', '#82ca9d', '#ff8042'];

  // Additional data: Top tracks table
  const topTracks = [
    { title: 'Blinding Lights', plays: 150 },
    { title: 'Levitating', plays: 120 },
    { title: 'Peaches', plays: 100 },
    { title: 'Save Your Tears', plays: 90 },
  ];

  // Calculate percentage change
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 'N/A'; // Avoid division by zero
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtected = async () => {
      try {
        const res = await fetch('http://localhost:8000/protected', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.text();
        console.log('Protected data:', data);
      } catch (err) {
        console.warn('JWT invalid or expired, redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
      }
    };

    fetchProtected();
  }, [navigate]);

  const user = localStorage.getItem("username");

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1>Welcome back, {user}</h1>
        <h1>Your Music Dashboard</h1>
        <h5>Gain insights into your listening habits and discover trends.</h5>

        {/* New AI Cover Section */}
        <div
          className="ai-cover-section"
          style={{
            margin: '20px 0',
            padding: '10px',
            background: '#f2f2f2',
            borderRadius: '8px',
          }}
        >
          <h2>AI Generated Playlist Cover</h2>
          <button
            className="button"
            onClick={getAICover}
            style={{ marginBottom: '10px' }}
          >
            Generate Playlist Cover
          </button>
          {coverImage && (
            <img
              src={coverImage}
              alt="AI Generated Playlist Cover"
              style={{
                maxWidth: '300px',
                display: 'block',
                border: '3px solid red',
              }}
            />
          )}

          {!coverImage && <p>No cover generated yet.</p>}
        </div>

        {/* Time Spent Bar Chart */}
        <div className="stats-section">
          <h2>Time Spent Listening</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="timeSpent" fill="#30e849" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
          <p>
            Change from last week:{' '}
            <strong>
              {getPercentageChange(
                userStats.thisWeek.timeSpent,
                userStats.lastWeek.timeSpent
              )}
            </strong>
          </p>
        </div>

        {/* Favorite Artist */}
        <div className="stats-section">
          <h2>Favorite Artist</h2>
          <p>
            This Week: <strong>{userStats.thisWeek.favoriteArtist}</strong>
          </p>
          <p>
            Last Week: <strong>{userStats.lastWeek.favoriteArtist}</strong>
          </p>
        </div>

        {/* Favorite Genre */}
        <div className="stats-section">
          <h2>Favorite Genre</h2>
          <p>
            This Week: <strong>{userStats.thisWeek.favoriteGenre}</strong>
          </p>
          <p>
            Last Week: <strong>{userStats.lastWeek.favoriteGenre}</strong>
          </p>
        </div>
        <div
          className="stats-section"
          style={{
            backgroundColor: '#252525',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>
            Genre Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
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
              <Tooltip
                contentStyle={{ backgroundColor: '#333', border: 'none' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Top Tracks */}
        <div
          className="stats-section"
          style={{
            backgroundColor: '#252525',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>
            Top Tracks
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Track
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Plays
                </th>
              </tr>
            </thead>
            <tbody>
              {topTracks.map((track, index) => (
                <tr key={index}>
                  <td
                    style={{ padding: '8px', borderBottom: '1px solid #444' }}
                  >
                    {track.title}
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'right',
                      borderBottom: '1px solid #444',
                    }}
                  >
                    {track.plays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
