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
    const username = req.headers['x-username'];
    if (!username) {
      return res.status(400).json({ error: 'Missing username in headers' });
    }

    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          Authorization: `Bearer ${req.spotifyToken}`,
        },
      }
    );

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let record = await WeeklyListening.findOne({
      username,
      weekStart: startOfWeek,
    });

    const lastUpdated = record?.lastUpdated ?? new Date(0);

    const newTracks = response.data.items.filter(
      (item) => new Date(item.played_at) > lastUpdated
    );

    const deltaMs = newTracks.reduce(
      (acc, item) => acc + item.track.duration_ms,
      0
    );

    if (!record) {
      await WeeklyListening.create({
        username,
        weekStart: startOfWeek,
        durationMs: deltaMs,
        lastUpdated: now,
      });
    } else {
      record.durationMs += deltaMs;
      record.lastUpdated = now;
      await record.save();
    }

    // res.json({ items: newTracks });
    res.json({ items: response.data.items });
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
    console.error('Error fetching listening history:', err);
    res.status(500).json({ error: 'Failed to fetch listening history' });
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

// Get user's top albums (based on top tracks)
router.get('/top-albums', checkSpotifyToken, async (req, res) => {
  try {
    console.log(
      'Fetching top albums with token:',
      req.spotifyToken.substring(0, 10) + '...'
    );

    const topTracksRes = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks?limit=50',
      {
        headers: {
          Authorization: `Bearer ${req.spotifyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract unique album IDs
    const albumIds = [
      ...new Set(topTracksRes.data.items.map((track) => track.album.id)),
    ].slice(0, 5);

    // Fetch full album data for each
    const albumDetails = await Promise.all(
      albumIds.map((id) =>
        axios
          .get(`https://api.spotify.com/v1/albums/${id}`, {
            headers: {
              Authorization: `Bearer ${req.spotifyToken}`,
            },
          })
          .then((res) => res.data)
      )
    );

    const formattedAlbums = albumDetails.map((album) => ({
      id: album.id,
      name: album.name,
      image: album.images[0]?.url,
      artists: album.artists.map((a) => a.name).join(', '),
      release_date: album.release_date,
      total_tracks: album.total_tracks,
      label: album.label,
      popularity: album.popularity,
      url: album.external_urls.spotify,
    }));

    res.json({ items: formattedAlbums });
  } catch (error) {
    console.error(
      'Error fetching top albums:',
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch top albums',
      details: error.response?.data || error.message,
    });
  }
});

export default router;
