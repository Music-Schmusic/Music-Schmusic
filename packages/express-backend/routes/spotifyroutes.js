import express from 'express';
const router = express.Router();

router.get('/top-tracks', async (req, res) => {
  try {
    const accessToken = req.session.spotifyAccessToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token. User not authenticated.' });
    }

    // Using native fetch instead of axios
    const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    
    // Make sure the request was successful
    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user top tracks: ', error.message);
    return res.status(500).json({ error: 'Failed to fetch user top tracks' });
  }
});

export default router;