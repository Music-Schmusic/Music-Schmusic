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

  fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${req.spotifyToken}` },
  })
    .then((data) => data.json())
    .then((json) => {
      if (!json.items) {
        console.log(json);
        throw new Error('Unexpected response');
      }

      let queries = [];
      let i = 0;
      for (const artist of json.items) {
        for (const genre of artist.genres) {
          queries[i++] = {
            artist: artist.name,
            genre: genre,
          };
        }
      }
      console.log(queries);

      let searchUrl = '';
      let results = {};
      let x = 0;
      for (const query of queries) {
        searchUrl = `https://api.spotify.com/v1/search?q=${query.artist}&type=track&limit=5&offset=15&genre=${query.genre}`;
        fetch(searchUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${req.spotifyToken}` },
        })
          .then((data) => data.json())
          .then((json) => {
            console.log(json);
            if (json.error) {
              throw new Error('rate limit??');
            }
            const tracks = parseItems(json.tracks.items);
            //console.log(tracks);
            results[x++] = tracks;
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
