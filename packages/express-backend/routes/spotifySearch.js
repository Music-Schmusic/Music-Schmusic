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
  // grab top artists
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

    const json = await response.json();

    // extract artist names from response
    let names = json.items.map((item) => item.name);

    let searchUrl = '';
    const results = [];
    let listSize = 25; // not a true cap

    // for each name, search for spotify results
    for (const name of names) {
      // introduces a bit of randomness
      const offset = Math.floor(Math.random() * 25);
      // grab 1-5 songs from artist
      const limit = Math.min(Math.floor(Math.random() * 3 + 2), listSize);
      listSize = Math.max(1, listSize - limit);

      searchUrl = `https://api.spotify.com/v1/search?q=${name}&type=track&limit=${limit}&offset=${offset}`;
      try {
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${req.spotifyToken}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch search results: ', response.text);
        }

        const json = await response.json();

        // select interesting fields
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
    // shuffle up list
    shuffleList(results);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
  }
});

function shuffleList(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export default router;
