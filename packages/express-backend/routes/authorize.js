import express from 'express';
import querystring from 'querystring';
import cors from 'cors';
import Account from '../schemas/account.js';

const app = express();
const router = express.Router();
app.use(cors());

//throwaway account its fine
let client_id = '1d896050be0f4f0c8aef60ca671d3789';
let client_secret = '26391446c4ba4249952b65b90d84238e';
const redirect_uri = 'http://localhost:8000/callback';

//request authorization code
router.get('/authorize', function (req, res) {
  //csrf token
  const state = generateState(16);
  //user scopes
  const scope =
    'user-read-private user-read-email user-top-read user-read-recently-played';
  //query string
  const auth_query = querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });
  console.log('\nauthorization query being sent:\n', auth_query);

  //return to user to allow spotify app to request data
  res.json({ authUrl: 'https://accounts.spotify.com/authorize?' + auth_query });
});

//recieve authorization code and request access tokens
router.get('/callback', async function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var username = req.query.username || null;

  //security feature, in case of cross-site request forgery
  if (state === null) {
    console.log('State Mismatch');
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch',
        })
    );
  } else {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      }),
    };

    try {
      //request access token
      const response = await fetch(authOptions.url, {
        method: authOptions.method,
        headers: authOptions.headers,
        body: authOptions.body,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }

      const json = await response.json();
      const access_token = json.access_token;
      const refresh_token = json.refresh_token;
      const expires_in = json.expires_in;

      // Store tokens in user's account
      if (username) {
        const user = await Account.findOne({ username });
        if (user) {
          user.spotifyAccessToken = access_token;
          user.spotifyRefreshToken = refresh_token;
          user.spotifyTokenExpiresAt = new Date(Date.now() + expires_in * 1000);
          await user.save();
        }
      }

      const redirectFrontend = `http://localhost:5173/oauth-success?access_token=${access_token}`;
      res.redirect(redirectFrontend);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error retrieving access token');
    }
  }
});

//session table for access token
//generate random string
function generateState(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  let count = 0;
  while (count < length) {
    state += characters.charAt(Math.floor(Math.random() * characters.length));
    count++;
  }
  return state;
}

export default router;
