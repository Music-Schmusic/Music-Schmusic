// spotifyroutes.test.js
import request from 'supertest';
import { jest } from '@jest/globals';

const mockTracksResponse = { data: { items: ['track1', 'track2'] } };
const mockArtistsResponse = { data: { items: ['artist1', 'artist2'] } };
const mockRecentResponse = { data: { items: ['recent1', 'recent2'] } };

// Mock the axios module before importing the app
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn()
  }
}));

// Now dynamically import axios and the app
const axios = (await import('axios')).default;
const app = (await import('../backend.js')).default;

const mockToken = 'Bearer mocked_token';

describe('Spotify Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /spotify/top-tracks - success', async () => {
    axios.get.mockResolvedValueOnce(mockTracksResponse);

    const res = await request(app)
      .get('/spotify/top-tracks')
      .set('Authorization', mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTracksResponse.data);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/top/tracks'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: mockToken
        })
      })
    );
  });

  test('GET /spotify/top-artists - success', async () => {
    axios.get.mockResolvedValueOnce(mockArtistsResponse);

    const res = await request(app)
      .get('/spotify/top-artists')
      .set('Authorization', mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockArtistsResponse.data);
  });

  test('GET /spotify/recently-played - success', async () => {
    axios.get.mockResolvedValueOnce(mockRecentResponse);

    const res = await request(app)
      .get('/spotify/recently-played')
      .set('Authorization', mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockRecentResponse.data);
  });

  test('GET /spotify/top-tracks - missing token', async () => {
    const res = await request(app).get('/spotify/top-tracks');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'No Spotify token provided');
  });

  test('GET /spotify/top-tracks - Spotify API error', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Invalid token' }
      }
    });

    const res = await request(app)
      .get('/spotify/top-tracks')
      .set('Authorization', mockToken);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Failed to fetch top tracks');
    expect(res.body.details).toEqual({ error: 'Invalid token' });
  });
});
