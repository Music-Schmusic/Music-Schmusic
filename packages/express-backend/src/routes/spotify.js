import express from 'express';
import axios from 'axios';

const router = express.Router();

// Middleware to extract token from Authorization header
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('No authorization header');
  }
  return authHeader.split(' ')[1];
};

router.get('/top-tracks', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    console.log(
      'Fetching top tracks with token:',
      token.substring(0, 20) + '...'
    );

    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
          time_range: 'short_term',
        },
      }
    );

    res.json(response.data.items);
  } catch (error) {
    console.error(
      'Error fetching top tracks:',
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch top tracks' },
    });
  }
});

router.get('/top-artists', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    console.log(
      'Fetching top artists with token:',
      token.substring(0, 20) + '...'
    );

    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/artists',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
          time_range: 'short_term',
        },
      }
    );

    res.json(response.data.items);
  } catch (error) {
    console.error(
      'Error fetching top artists:',
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch top artists' },
    });
  }
});

router.get('/recently-played', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    console.log(
      'Fetching recently played with token:',
      token.substring(0, 20) + '...'
    );

    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
        },
      }
    );

    res.json(response.data.items);
  } catch (error) {
    console.error(
      'Error fetching recently played:',
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || {
        message: 'Failed to fetch recently played tracks',
      },
    });
  }
});

// ESM-compatible export
export default router;
