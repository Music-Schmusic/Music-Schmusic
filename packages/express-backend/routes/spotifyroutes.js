import express from 'express';
import authenticateUser from '../authMiddleware.js';
import fetch from 'node-fetch';
const router = express.Router();

router.get('/top-tracks', authenticateUser, async (req, res) => {
  // Retrieve the Spotify access token from the JWT payload (or session)
  const accessToken = req.user.spotifyAccessToken; // This requires your JWT to include spotifyAccessToken
  if (!accessToken) {
    return res.status(401).json({ error: 'No Spotify access token provided' });
  }

  try {
    // Fetch the top tracks from Spotify API
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch top tracks from Spotify');
    }
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error in /top-tracks:', error);
    return res.status(500).json({ error: error.message });
  }
});
export default router;
