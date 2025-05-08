import express from 'express';
import querystring from 'querystring';
import cors from 'cors';
import dotenv from 'dotenv';
import Account from '../schemas/account.js';
import spotifyFetch from './authorizehelper.js'; // abstracted fetch function

dotenv.config();

const router = express.Router();
router.use(cors());

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_SECRET_ID;
const redirect_uri =
  process.env.SPOTIFY_REDIRECT_URI ||
  'http://localhost:8000/authorize/callback';
const frontend_url = process.env.FRONTEND_URL || 'http://localhost:5173';

// Generate a random string for CSRF protection
function generateState(length) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Step 1: Direct user to Spotify authorization page
router.get('/authorize', (req, res) => {
  const state = generateState(16);
  const scope =
    'user-read-private user-read-email user-top-read user-read-recently-played';

  const auth_query = querystring.stringify({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
    state,
  });

  console.log('\nAuthorization query being sent:\n', auth_query);
  res.json({ authUrl: `https://accounts.spotify.com/authorize?${auth_query}` });
});

// Step 2: Handle Spotify redirect with authorization code
router.get('/callback', async (req, res) => {
  const { code, state, username } = req.query;

  if (!state) {
    console.log('State mismatch');
    return res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch',
        })
    );
  }

  const url = 'https://accounts.spotify.com/api/token';
  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
    },
    body: new URLSearchParams({
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }),
  };

  try {
    const response = await spotifyFetch(url, authOptions);
    if (!response.ok) {
      throw new Error(`Spotify token fetch failed: ${response.statusText}`);
    }

    const json = await response.json();
    const { access_token, refresh_token, expires_in } = json;

    if (username) {
      const user = await Account.findOne({ username });
      if (user) {
        user.spotifyAccessToken = access_token;
        user.spotifyRefreshToken = refresh_token;
        user.spotifyTokenExpiresAt = new Date(Date.now() + expires_in * 1000);
        await user.save();
      }
    }

    const redirectFrontend = `${frontend_url}/oauth-success?access_token=${access_token}`;
    res.redirect(redirectFrontend);
  } catch (err) {
    console.error('Spotify OAuth error:', err);
    res.status(500).send('Error retrieving access token');
  }
});

export default router;
