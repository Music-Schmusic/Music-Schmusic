import request from 'supertest';
import { jest } from '@jest/globals';

const mockTracksResponse = { data: { items: ['track1', 'track2'] } };
const mockArtistsResponse = { data: { items: ['artist1', 'artist2'] } };
const now = new Date().toISOString();

const mockRecentResponse = {
  data: {
    items: [
      {
        track: { duration_ms: 123000 },
        played_at: now,
      },
      {
        track: { duration_ms: 98000 },
        played_at: now,
      },
    ],
  },
};


// Mock the axios module before importing the app
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
  },
}));

jest.unstable_mockModule('../schemas/WeeklyListening.js', () => ({
  default: {
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
  },
}));
// Now dynamically import axios and the app
const axios = (await import('axios')).default;
const app = (await import('../backend.js')).default;
const WeeklyListening = (await import('../schemas/WeeklyListening.js')).default;

const mockToken = 'Bearer mocked_token';

describe('Spotify Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /spotify/stats/top-tracks - success', async () => {
    axios.get.mockResolvedValueOnce(mockTracksResponse);

    const res = await request(app)
      .get('/spotify/stats/top-tracks')
      .set('Authorization', mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTracksResponse.data);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/top/tracks'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: mockToken,
        }),
      })
    );
  });

  test('GET /spotify/stats/top-artists - success', async () => {
    axios.get.mockResolvedValueOnce(mockArtistsResponse);

    const res = await request(app)
      .get('/spotify/stats/top-artists')
      .set('Authorization', mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockArtistsResponse.data);
  });

  test('GET /spotify/stats/recently-played - success', async () => {
    axios.get.mockResolvedValueOnce(mockRecentResponse);

    const res = await request(app)
      .get('/spotify/stats/recently-played')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockRecentResponse.data);
  });

  test('GET /spotify/stats/top-tracks - missing token', async () => {
    const res = await request(app).get('/spotify/stats/top-tracks');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'No Spotify token provided');
  });

  test('GET /spotify/stats/top-tracks - Spotify API error', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Invalid token' },
      },
    });

    const res = await request(app)
      .get('/spotify/stats/top-tracks')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Failed to fetch top tracks');
    expect(res.body.details).toEqual({ error: 'Invalid token' });
  });

  test('GET /spotify/stats/recently-played - Spotify API error', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Invalid token' },
      },
    });

    const res = await request(app)
      .get('/spotify/stats/recently-played')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty(
      'error',
      'Failed to fetch recently played tracks'
    );
  });
});
