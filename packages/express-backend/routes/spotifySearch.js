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
    'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=10';

  fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${req.spotifyToken}` },
  })
    .then((data) => data.json())
    .then((json) => {
      if (!json.items) {
        console.log(json);
        throw new Error('Unexpected response.');
      }
      let names = '';
      let query = '';
      let track = '';
      let searchUrl = '';
      let results = {};

      for (let i = 0; i < json.items.length; i++) {
        track = json.items[i];
        query = track.artists[0].name + ' ' + track.name;
        searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`;

        fetch(searchUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${req.spotifyToken}` },
        })
          .then((data) => data.json())
          .then((json) => {
            if (json.length < 5) {
              throw new Error('rate limit??');
            }
            const tracks = parseItems(json.tracks.items);
            console.log(tracks);
            results[i] = tracks;
          })
          .catch((error) => {
            console.log(error);
          });
      }
      console.log(results);
      res.status(200).json(results);
    })
    .catch((error) => {
      console.log(error);
    });
});

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
  console.log(result);
  return result;
}

export default router;
