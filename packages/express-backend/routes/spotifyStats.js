import express from 'express';
import axios from 'axios';
import WeeklyListening from '../schemas/WeeklyListening.js';
import authenticateUser from '../authMiddleware.js';



const router = express.Router();

// Middleware to check for Spotify token
const checkSpotifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided in request headers');
    return res.status(401).json({ error: 'No Spotify token provided' });
  }
  req.spotifyToken = token;
  next();
};

// Get user's top tracks
router.get('/top-tracks', checkSpotifyToken, async (req, res) => {
  try {
    console.log(
      'Fetching top tracks with token:',
      req.spotifyToken.substring(0, 10) + '...'
    );
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10',
      {
        headers: {
          Authorization: `Bearer ${req.spotifyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching top tracks:',
      error.response.data,
      'Status:',
      error.response.status
    );
    res.status(error.response.status).json({
      error: 'Failed to fetch top tracks',
      details: error.response.data,
    });
  }
});

// Get user's top artists
router.get('/top-artists', checkSpotifyToken, async (req, res) => {
  try {
    console.log(
      'Fetching top artists with token:',
      req.spotifyToken.substring(0, 10) + '...'
    );
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10',
      {
        headers: {
          Authorization: `Bearer ${req.spotifyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching top artists:',
      error.response.data,
      'Status:',
      error.response.status
    );
    res.status(error.response.status).json({
      error: 'Failed to fetch top artists',
      details: error.response.data,
    });
  }
});

// Get user's recently played tracks
router.get('/recently-played', checkSpotifyToken, async (req, res) => {
  try {
    const username = req.headers['x-username']; // Sent from frontend
    if (!username) {
      return res.status(400).json({ error: 'Missing username in headers' });
    }

    console.log('Fetching recently played with token:', req.spotifyToken.substring(0, 10) + '...');

    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          Authorization: `Bearer ${req.spotifyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const totalMs = response.data.items.reduce(
      (acc, item) => acc + item.track.duration_ms,
      0
    );

    // Get the start of the current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    await WeeklyListening.findOneAndUpdate(
      { username, weekStart: startOfWeek },
      { $inc: { durationMs: totalMs } },
      { upsert: true, new: true }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recently played:', error.message);
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
});

router.get('/listening-history', async (req, res) => {
  const username = req.headers['x-username'];
  if (!username) {
    return res.status(400).json({ error: 'Missing username in headers' });
  }

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const history = await WeeklyListening.find({
      username,
      weekStart: { $gte: oneYearAgo },
    }).sort({ weekStart: 1 });

    res.json(history);
  } catch (err) {
    console.error("Error fetching listening history:", err);
    res.status(500).json({ error: "Failed to fetch listening history" });
  }
});


// Get user's playlists
router.get('/playlists', checkSpotifyToken, async (req, res) => {
  try {
    console.log(
      'Fetching playlists with token:',
      req.spotifyToken.substring(0, 10) + '...'
    );
    const response = await axios.get(
      'https://api.spotify.com/v1/me/playlists?limit=10',
      {
        headers: {
          Authorization: `Bearer ${req.spotifyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching playlists:',
      error.response?.data || error.message,
      'Status:',
      error.response?.status || 'Unknown'
    );
    res
      .status(error.response?.status || 500)
      .json({ error: 'Failed to fetch playlists' });
  }
});

//route for adding time to database to test bar chart (Can be removed later to improve test coverage)
router.post('/test-insert-week', authenticateUser, async (req, res) => {
  const { weekOffset, durationMs } = req.body; // e.g., { weekOffset: 2, durationMs: 3600000 }

  const username = req.user.username;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() - (7 * weekOffset));
  startOfWeek.setHours(0, 0, 0, 0);

  try {
    const result = await WeeklyListening.findOneAndUpdate(
      { username, weekStart: startOfWeek },
      { $set: { durationMs } },
      { upsert: true, new: true }
    );
    res.json({ message: 'Inserted test data', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Test insert failed' });
  }
});


export default router;
