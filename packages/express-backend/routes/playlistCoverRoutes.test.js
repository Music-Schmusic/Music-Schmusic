// playlistCoverRoutes.test.js
import request from 'supertest';
import { jest } from '@jest/globals';

const mockImageData = 'base64-image-data';
const mockGenres = ['Rock', 'Hip-Hop', 'Pop'];

// Mock generatePlaylistCover and getTopGenres
jest.unstable_mockModule('../imagen.js', () => ({
  generatePlaylistCover: jest.fn(),
}));

const { generatePlaylistCover } = await import('../imagen.js');

// Now import the Express app and router
const express = await import('express');
const playlistCoverRoutes = (await import('./playlistCoverRoutes.js')).default;

const app = express.default();
app.use(express.default.json()); // enable JSON parsing
app.use('/cover', playlistCoverRoutes); // mount the route under /cover

describe('POST /cover/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 if userId is missing', async () => {
    const res = await request(app).post('/cover/generate').send({}); // missing userId

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'userId is required in the request body.'
    );
  });

  test('returns image when prompt generation succeeds', async () => {
    generatePlaylistCover.mockResolvedValueOnce({
      predictions: [mockImageData],
    });

    const res = await request(app)
      .post('/cover/generate')
      .send({ userId: '123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('image', mockImageData);
    expect(generatePlaylistCover).toHaveBeenCalledWith(
      expect.stringContaining('Rock, Hip-Hop, Pop')
    );
  });

  test('returns 500 when generatePlaylistCover fails', async () => {
    generatePlaylistCover.mockRejectedValueOnce(new Error('API failure'));

    const res = await request(app)
      .post('/cover/generate')
      .send({ userId: '123' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty(
      'error',
      'Failed to generate playlist cover.'
    );
  });

  test('returns 500 if no image is returned from API', async () => {
    generatePlaylistCover.mockResolvedValueOnce({
      predictions: [],
    });

    const res = await request(app)
      .post('/cover/generate')
      .send({ userId: '123' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty(
      'error',
      'Failed to generate playlist cover.'
    );
  });
});
