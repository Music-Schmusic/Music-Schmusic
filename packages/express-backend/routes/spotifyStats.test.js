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
// dynamically import axios and the app
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

  test('GET /spotify/stats/top-artists - failure', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Invalid token' },
      },
    });

    const res = await request(app)
      .get('/spotify/stats/top-artists')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Failed to fetch top artists');
    expect(res.body.details).toEqual({ error: 'Invalid token' });
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

  test('GET /spotify/stats/recently-played - missing username', async () => {
    const res = await request(app)
      .get('/spotify/stats/recently-played')
      .set('Authorization', mockToken);
  
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing username in headers');
    expect(axios.get).not.toHaveBeenCalled();
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

  test('GET /spotify/stats/recently-played - updates existing record', async () => {
    const existingDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const mockSave = jest.fn();
  
    const mockExistingRecord = {
      durationMs: 1000,
      lastUpdated: existingDate,
      save: mockSave,
    };
  
    // Replace mock for this specific case
    WeeklyListening.findOne.mockResolvedValue(mockExistingRecord);
  
    axios.get.mockResolvedValueOnce({
      data: {
        items: [
          { played_at: new Date().toISOString(), track: { duration_ms: 60000 } },
          { played_at: new Date().toISOString(), track: { duration_ms: 60000 } },
        ],
      },
    });
  
    const res = await request(app)
      .get('/spotify/stats/recently-played')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(200);
    expect(mockSave).toHaveBeenCalled();
    expect(mockExistingRecord.durationMs).toBeGreaterThan(1000);
  }); 
  
  test('GET /spotify/stats/listening-history - missing username', async () => {
    const res = await request(app)
      .get('/spotify/stats/listening-history')
      .set('Authorization', mockToken);
  
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing username in headers');
  });

  test('GET /spotify/stats/listening-history - success', async () => {
    const mockHistory = [
      { username: 'unittestuser', weekStart: new Date('2024-07-01'), durationMs: 120000 },
      { username: 'unittestuser', weekStart: new Date('2024-07-08'), durationMs: 180000 },
    ];
  
    const sortMock = jest.fn().mockResolvedValue(mockHistory);
    const findMock = jest.fn().mockReturnValue({ sort: sortMock });
  
    WeeklyListening.find = findMock;
  
    const res = await request(app)
      .get('/spotify/stats/listening-history')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ username: 'unittestuser', durationMs: 120000 }),
          expect.objectContaining({ username: 'unittestuser', durationMs: 180000 }),
        ])
      );      
  });

  test('GET /spotify/stats/listening-history - DB error', async () => {
    WeeklyListening.find.mockImplementationOnce(() => {
      throw new Error('DB read failed');
    });
  
    const res = await request(app)
      .get('/spotify/stats/listening-history')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch listening history');
  });

  test('GET /spotify/stats/playlists - success', async () => {
    const mockPlaylists = {
      items: [{ name: 'Playlist 1' }, { name: 'Playlist 2' }],
    };
  
    axios.get.mockResolvedValueOnce({ data: mockPlaylists });
  
    const res = await request(app)
      .get('/spotify/stats/playlists')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockPlaylists);
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/playlists?limit=10',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer mocked_token`,
        }),
      })
    );
  });  


  test('GET /spotify/stats/playlists - Spotify API error', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Invalid token' },
      },
    });
  
    const res = await request(app)
      .get('/spotify/stats/playlists')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Failed to fetch playlists');
  });

  test('GET /spotify/stats/top-albums - success', async () => {
    // Mock top tracks response (with duplicate album IDs)
    const mockTopTracks = {
      items: [
        { album: { id: 'a1' } },
        { album: { id: 'a2' } },
        { album: { id: 'a3' } },
        { album: { id: 'a1' } }, // duplicate
        { album: { id: 'a4' } },
        { album: { id: 'a5' } },
        { album: { id: 'a6' } }, // will get sliced off
      ],
    };
  
    const mockAlbumData = (id) => ({
      id,
      name: `Album ${id}`,
      images: [{ url: `http://img/${id}.jpg` }],
      artists: [{ name: `Artist ${id}` }],
      release_date: '2020-01-01',
      total_tracks: 10,
      label: `Label ${id}`,
      popularity: 50,
      external_urls: { spotify: `https://spotify.com/album/${id}` },
    });
  
    // First call = top tracks
    axios.get.mockResolvedValueOnce({ data: mockTopTracks });
  
    // Next 5 calls = albums/a1 to albums/a5
    const albumResponses = ['a1', 'a2', 'a3', 'a4', 'a5'].map((id) => ({
      data: mockAlbumData(id),
    }));
    albumResponses.forEach((res) => axios.get.mockResolvedValueOnce(res));
  
    const res = await request(app)
      .get('/spotify/stats/top-albums')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.items[0]).toHaveProperty('name');
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/top/tracks?limit=50',
      expect.any(Object)
    );
  });

  test('GET /spotify/stats/top-albums - top tracks fetch error', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { error: 'Invalid token' },
      },
    });
  
    const res = await request(app)
      .get('/spotify/stats/top-albums')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Failed to fetch top albums');
  });

  test('GET /spotify/stats/playlists - network error (no response)', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network down'));
  
    const res = await request(app)
      .get('/spotify/stats/playlists')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch playlists' });
  });

  test('GET /spotify/stats/top-albums - network error (no response)', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
  
    const res = await request(app)
      .get('/spotify/stats/top-albums')
      .set('Authorization', mockToken)
      .set('x-username', 'unittestuser');
  
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: 'Failed to fetch top albums',
      details: 'Network error',
    });
  });
});
