import express from 'express';
import axios from 'axios';

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
    console.log(
      'Fetching recently played with token:',
      req.spotifyToken.substring(0, 10) + '...'
    );
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=10',
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
      'Error fetching recently played:',
      error.response.data,
      'Status:',
      error.response.status
    );
    res.status(error.response.status).json({
      error: 'Failed to fetch recently played tracks',
      details: error.response.data,
    });
  }
});

export default router;
