import express from 'express';

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

router.get('/', checkSpotifyToken, async (req, res) => {
  const url =
    'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10';
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${req.spotifyToken}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    const artistJson = await response.json();

    let names = artistJson.items.map((item) => item.name);
    let searchUrl = '';
    const results = [];
    for (const name of names) {
      const offset = Math.floor(Math.random() * 30);
      const limit = Math.floor(Math.random() * 8 + 1);
      searchUrl = `https://api.spotify.com/v1/search?q=${name}&type=track&limit=${limit}&offset=${offset}`;
      try {
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${req.spotifyToken}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const json = await response.json();
        console.log(json);
        for (const track of json.tracks.items) {
          results.push({
            id: track.id,
            name: track.name,
            image: track.album.images[0]?.url,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
            popularity: track.popularity,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    console.log('These are results:');
    console.log(results);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
  }
});

async function seqFetch(queries, token) {
  let results = {};
  let searchUrl = '';
  let x = 0;
  for (const query of queries) {
    searchUrl = `https://api.spotify.com/v1/search?q=${query.artist}&type=track&limit=5&offset=15`;
    try {
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      console.log(json);
      const tracks = parseItems(json.tracks.items);
      results[x++] = tracks;
    } catch (error) {
      console.log(error);
    }
  }
}

function parseItems(tracks) {
  let result = {};
  for (let i = 0; i < tracks.length; i++) {
    result[i] = {
      name: tracks[i].name,
      id: tracks[i].id,
      album: tracks[i].album.name,
      artist: tracks[i].artists[0].name,
    };
  }
  return result;
}

export default router;
