import fetch from 'node-fetch';
import Account from '../schemas/account.js';
import dotenv from 'dotenv';
dotenv.config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_SECRET_ID;

export async function getValidSpotifyAccessToken(username) {
    console.log('[refresh] Checking access token for user:', username);
  
    const user = await Account.findOne({ username });
    if (!user) {
      console.error('[refresh] No user found for username:', username);
      throw new Error('User not found');
    }
  
    if (user.spotifyTokenExpiresAt > new Date()) {
      console.log('[refresh] Token still valid for', username);
      return user.spotifyAccessToken;
    }
  
    console.log('[refresh] Token expired, refreshing for', username);
  
    // Add logging for Spotify POST
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.spotifyRefreshToken,
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[refresh] Spotify token refresh failed:', errorData);
      throw new Error('Spotify refresh failed: ' + errorData.error_description);
    }
  
    const json = await response.json();
    user.spotifyAccessToken = json.access_token;
    user.spotifyTokenExpiresAt = new Date(Date.now() + json.expires_in * 1000);
    await user.save();
  
    return json.access_token;
  }
  
