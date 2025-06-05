import request from 'supertest';
import { jest } from '@jest/globals';

// Mock modules before import
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

jest.unstable_mockModule('@google-cloud/vertexai', () => ({
  VertexAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

jest.unstable_mockModule('google-auth-library', () => ({
  GoogleAuth: jest.fn(() => ({})),
}));

// Mock environment variables
process.env.GAI_KEY = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'test-key-id',
  private_key: 'test-key',
  client_email: 'test@test.iam.gserviceaccount.com',
  client_id: 'test-client-id',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com',
});

// Load modules after mocks
const express = (await import('express')).default;
const { VertexAI } = await import('@google-cloud/vertexai');
const { GoogleAuth } = await import('google-auth-library');
const playlistRecommendRouter = (await import('./playlistRecommendRoutes.js'))
  .default;

const app = express();
app.use(express.json());
app.use('/api/playlist-recommendations', playlistRecommendRouter);

describe('Playlist Recommend Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/playlist-recommendations/generate returns 400 when genres array is missing', async () => {
    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing or invalid genres');
  });

  test('POST /api/playlist-recommendations/generate returns 400 when genres is not an array', async () => {
    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: 'rock' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing or invalid genres');
  });

  test('POST /api/playlist-recommendations/generate returns 400 when genres array is empty', async () => {
    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing or invalid genres');
  });

  test('POST /api/playlist-recommendations/generate successfully generates recommendations', async () => {
    const mockRecommendations = [
      {
        artist: 'The Beatles',
        songs: [
          { title: 'Hey Jude', spotifyUrl: 'spotify:track:123' },
          { title: 'Let It Be', spotifyUrl: 'spotify:track:124' },
          { title: 'Yesterday', spotifyUrl: 'spotify:track:125' },
          { title: 'Come Together', spotifyUrl: 'spotify:track:126' },
          { title: 'Help!', spotifyUrl: 'spotify:track:127' },
        ],
      },
      {
        artist: 'Queen',
        songs: [
          { title: 'Bohemian Rhapsody', spotifyUrl: 'spotify:track:223' },
          { title: 'We Will Rock You', spotifyUrl: 'spotify:track:224' },
          { title: 'We Are the Champions', spotifyUrl: 'spotify:track:225' },
          { title: 'Radio Ga Ga', spotifyUrl: 'spotify:track:226' },
          { title: 'Somebody to Love', spotifyUrl: 'spotify:track:227' },
        ],
      },
    ];

    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockRecommendations),
                },
              ],
            },
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['rock', 'pop', 'classic rock'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual(mockRecommendations);

    // Verify the model was called with correct prompt
    expect(mockGenerateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: expect.stringContaining(
                'Based on these top genres: rock, pop, classic rock'
              ),
            },
          ],
        },
      ],
    });
  });

  test('POST /api/playlist-recommendations/generate handles markdown-wrapped JSON response', async () => {
    const mockRecommendations = [
      {
        artist: 'Pink Floyd',
        songs: [
          { title: 'Wish You Were Here', spotifyUrl: 'spotify:track:323' },
          { title: 'Comfortably Numb', spotifyUrl: 'spotify:track:324' },
          { title: 'Time', spotifyUrl: 'spotify:track:325' },
          { title: 'Money', spotifyUrl: 'spotify:track:326' },
          {
            title: 'Another Brick in the Wall',
            spotifyUrl: 'spotify:track:327',
          },
        ],
      },
    ];

    // Simulate response wrapped in markdown code blocks
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text:
                    '```json\n' + JSON.stringify(mockRecommendations) + '\n```',
                },
              ],
            },
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['progressive rock'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual(mockRecommendations);
  });

  test('POST /api/playlist-recommendations/generate returns empty array when AI response is invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'This is not valid JSON',
                },
              ],
            },
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['jazz'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual([]);
  });

  test('POST /api/playlist-recommendations/generate returns empty array when response structure is unexpected', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [],
      },
    });

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['electronic'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual([]);
  });

  test('POST /api/playlist-recommendations/generate returns 500 on Vertex AI error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Vertex AI error'));

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['hip-hop', 'rap'] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Recommendation generation failed');
  });

  test('POST /api/playlist-recommendations/generate handles timeout error', async () => {
    mockGenerateContent.mockRejectedValue(
      new Error('timeout of 120000ms exceeded')
    );

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['ambient', 'experimental'] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Recommendation generation failed');
  });

  test('POST /api/playlist-recommendations/generate constructs correct prompt with multiple genres', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '[]',
                },
              ],
            },
          },
        ],
      },
    });

    const genres = ['indie', 'folk', 'acoustic', 'singer-songwriter'];
    await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres });

    expect(mockGenerateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: expect.stringContaining(
                `Based on these top genres: ${genres.join(', ')}, recommend 10 different music artists`
              ),
            },
          ],
        },
      ],
    });
  });

  test('POST /api/playlist-recommendations/generate handles complex nested response', async () => {
    const complexRecommendations = [
      {
        artist: 'Radiohead',
        songs: [
          {
            title: 'Creep',
            spotifyUrl: 'spotify:track:70LcF31zb1H0PyJoS1Sx1r',
          },
          {
            title: 'Karma Police',
            spotifyUrl: 'spotify:track:63OQupATfueTdZMWTxW03A',
          },
          {
            title: 'No Surprises',
            spotifyUrl: 'spotify:track:10nyNJ6zNy2YVYLrcwLccB',
          },
          {
            title: 'Paranoid Android',
            spotifyUrl: 'spotify:track:6LgJvl0Xdtc73RJ1mmpotq',
          },
          {
            title: 'Fake Plastic Trees',
            spotifyUrl: 'spotify:track:73CKjW3vsUXRpy3NnX4H7F',
          },
        ],
      },
    ];

    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(complexRecommendations),
                },
              ],
            },
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-recommendations/generate')
      .send({ genres: ['alternative rock', 'art rock'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toEqual(complexRecommendations);
    expect(res.body.recommendations[0].songs).toHaveLength(5);
    expect(res.body.recommendations[0].songs[0]).toHaveProperty('title');
    expect(res.body.recommendations[0].songs[0]).toHaveProperty('spotifyUrl');
  });
});
