import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  // Sample data structure for time spent
  const [userStats, setUserStats] = useState({
    thisWeek: { timeSpent: 12, favoriteArtist: 'Taylor Swift', favoriteGenre: 'Pop' },
    lastWeek: { timeSpent: 10, favoriteArtist: 'Drake', favoriteGenre: 'Hip-Hop' },
    twoWeeksAgo: { timeSpent: 8, favoriteArtist: 'The Weeknd', favoriteGenre: 'R&B' },
  });

  // Format data for Recharts
  const chartData = [
    { name: '5 Weeks Ago', timeSpent: userStats.twoWeeksAgo.timeSpent },
    { name: '4 Weeks Ago', timeSpent: userStats.lastWeek.timeSpent },
    { name: '3 Weeks Ago', timeSpent: userStats.thisWeek.timeSpent },
    { name: '2 Weeks Ago', timeSpent: userStats.twoWeeksAgo.timeSpent },
    { name: 'Last Week', timeSpent: userStats.lastWeek.timeSpent },
    { name: 'This Week', timeSpent: userStats.thisWeek.timeSpent },
  ];

  // Calculate percentage change
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return "N/A"; // Avoid division by zero
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1>Dashboard</h1>

        {/* Time Spent Bar Chart */}
        <div className="stats-section">
          <h2>Time Spent Listening</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="timeSpent" fill="#30e849" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
          <p>Change from last week: <strong>{getPercentageChange(userStats.thisWeek.timeSpent, userStats.lastWeek.timeSpent)}</strong></p>
        </div>

        {/* Favorite Artist */}
        <div className="stats-section">
          <h2>Favorite Artist</h2>
          <p>This Week: <strong>{userStats.thisWeek.favoriteArtist}</strong></p>
          <p>Last Week: <strong>{userStats.lastWeek.favoriteArtist}</strong></p>
        </div>

        {/* Favorite Genre */}
        <div className="stats-section">
          <h2>Favorite Genre</h2>
          <p>This Week: <strong>{userStats.thisWeek.favoriteGenre}</strong></p>
          <p>Last Week: <strong>{userStats.lastWeek.favoriteGenre}</strong></p>
        </div>
      </div>
    </div>
  );
}
