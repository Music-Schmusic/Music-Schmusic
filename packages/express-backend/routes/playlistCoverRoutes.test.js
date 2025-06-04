import request from 'supertest';
import { jest } from '@jest/globals';

// Mock modules before import
jest.unstable_mockModule('google-auth-library', () => ({
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getClient: jest.fn().mockResolvedValue({
      getAccessToken: jest.fn().mockResolvedValue({ token: 'mock_token' }),
    }),
  })),
}));

jest.unstable_mockModule('axios', () => ({
  default: {
    post: jest.fn(),
  },
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
const { GoogleAuth } = await import('google-auth-library');
const axios = (await import('axios')).default;
const playlistCoverRouter = (await import('./playlistCoverRoutes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/playlist-cover', playlistCoverRouter);

describe('Playlist Cover Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/playlist-cover/generate returns 400 when genres array is missing', async () => {
    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing genres array');
  });

  test('POST /api/playlist-cover/generate returns 400 when genres is not an array', async () => {
    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: 'rock' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing genres array');
  });

  test('POST /api/playlist-cover/generate returns 400 when genres array is empty', async () => {
    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing genres array');
  });

  test('POST /api/playlist-cover/generate successfully generates image with valid genres', async () => {
    const mockBase64Image =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    axios.post.mockResolvedValue({
      status: 200,
      data: {
        predictions: [
          {
            mimeType: 'image/png',
            bytesBase64Encoded: mockBase64Image,
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['rock', 'pop', 'jazz'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.image).toBe(`data:image/png;base64,${mockBase64Image}`);

    // Verify GoogleAuth was called correctly
    expect(GoogleAuth).toHaveBeenCalledWith({
      credentials: JSON.parse(process.env.GAI_KEY),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Verify axios was called with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://us-central1-aiplatform.googleapis.com/v1/'
      ),
      {
        instances: [
          {
            prompt:
              'Generate a creative playlist cover image based on the genres: rock, pop, jazz.',
          },
        ],
        parameters: { sampleCount: 1, aspectRatio: '1:1' },
      },
      {
        headers: {
          Authorization: 'Bearer mock_token',
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );
  });

  test('POST /api/playlist-cover/generate returns 500 when no image data in response', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        predictions: [{}], // No bytesBase64Encoded
      },
    });

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['rock'] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('No image data in response');
  });

  test('POST /api/playlist-cover/generate handles different mime types', async () => {
    const mockBase64Image = 'test-image-data';

    axios.post.mockResolvedValue({
      status: 200,
      data: {
        predictions: [
          {
            mimeType: 'image/jpeg',
            bytesBase64Encoded: mockBase64Image,
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['classical'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.image).toBe(`data:image/jpeg;base64,${mockBase64Image}`);
  });

  test('POST /api/playlist-cover/generate defaults to image/png when mimeType is missing', async () => {
    const mockBase64Image = 'test-image-data';

    axios.post.mockResolvedValue({
      status: 200,
      data: {
        predictions: [
          {
            bytesBase64Encoded: mockBase64Image,
          },
        ],
      },
    });

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['electronic'] });

    expect(res.statusCode).toBe(200);
    expect(res.body.image).toBe(`data:image/png;base64,${mockBase64Image}`);
  });

  test('POST /api/playlist-cover/generate returns 500 on Google Auth error', async () => {
    // Reset modules and mock with auth failure
    jest.resetModules();
    jest.unstable_mockModule('google-auth-library', () => ({
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn().mockRejectedValue(new Error('Auth failed')),
      })),
    }));

    const express = (await import('express')).default;
    const playlistCoverRouter = (await import('./playlistCoverRoutes.js'))
      .default;
    const app = express();
    app.use(express.json());
    app.use('/api/playlist-cover', playlistCoverRouter);

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['rock'] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal AI error');
  });

  test('POST /api/playlist-cover/generate returns 500 on axios error', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['hip-hop', 'rap'] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal AI error');
  });

  test('POST /api/playlist-cover/generate handles timeout error', async () => {
    axios.post.mockRejectedValue(new Error('timeout of 120000ms exceeded'));

    const res = await request(app)
      .post('/api/playlist-cover/generate')
      .send({ genres: ['ambient', 'experimental'] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal AI error');
  });

  test('POST /api/playlist-cover/generate constructs correct prompt with multiple genres', async () => {
    const mockBase64Image = 'test-image';

    axios.post.mockResolvedValue({
      status: 200,
      data: {
        predictions: [
          {
            mimeType: 'image/png',
            bytesBase64Encoded: mockBase64Image,
          },
        ],
      },
    });

    const genres = ['indie', 'folk', 'acoustic', 'singer-songwriter'];
    await request(app).post('/api/playlist-cover/generate').send({ genres });

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        instances: [
          {
            prompt: `Generate a creative playlist cover image based on the genres: ${genres.join(', ')}.`,
          },
        ],
      }),
      expect.any(Object)
    );
  });
});
