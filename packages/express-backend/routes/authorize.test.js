import request from 'supertest';
import { jest } from '@jest/globals';

// Mock modules before import
jest.unstable_mockModule('../schemas/account.js', () => ({
  default: {
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule('./authorizehelper.js', () => ({
  default: async (url, options) => {
    return {
      ok: true,
      json: async () => ({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      }),
    };
  },
}));

global.fetch = jest.fn(); // fallback if anything uses fetch

// Load modules after mocks
const express = (await import('express')).default;
const Account = (await import('../schemas/account.js')).default;
const spotifyRouter = (await import('./authorize.js')).default;

const app = express();
app.use(express.json());
app.use('/', spotifyRouter);

describe('Spotify OAuth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /authorize returns valid Spotify auth URL', async () => {
    const res = await request(app).get('/authorize');

    expect(res.statusCode).toBe(200);
    expect(res.body.authUrl).toContain(
      'https://accounts.spotify.com/authorize'
    );
    expect(res.body.authUrl).toContain('client_id=');
    expect(res.body.authUrl).toContain('redirect_uri=');
  });

  test('GET /callback returns error on state mismatch', async () => {
    const res = await request(app).get('/callback');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('state_mismatch');
  });

  test('GET /callback fetches tokens and saves to user', async () => {
    const mockUser = {
      spotifyAccessToken: '',
      spotifyRefreshToken: '',
      spotifyTokenExpiresAt: null,
      save: jest.fn(),
    };

    Account.findOne.mockResolvedValue(mockUser);

    const res = await request(app).get('/callback').query({
      code: 'valid-code',
      state: 'valid',
      username: 'testuser',
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('oauth-success?access_token=');
    expect(mockUser.save).toHaveBeenCalled();
  });

  test('GET /callback returns 500 if fetch fails', async () => {
    // Reset modules and mock with failure
    jest.resetModules();
    jest.unstable_mockModule('./authorizehelper.js', () => ({
      default: async () => {
        return { ok: false, statusText: 'Bad Request' };
      },
    }));

    const express = (await import('express')).default;
    const spotifyRouter = (await import('./authorize.js')).default;
    const app = express();
    app.use(express.json());
    app.use('/', spotifyRouter);

    const res = await request(app).get('/callback').query({
      code: 'bad-code',
      state: 'valid',
      username: 'testuser',
    });

    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Error retrieving access token');
  });
});
