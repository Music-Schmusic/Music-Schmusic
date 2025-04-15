import request from 'supertest';
import app from './backend.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import db_req from './dbrequests.js';

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  const conn = await mongoose.connect(uri);
  db_req.setDataBaseConn(conn);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Backend API tests', () => {
  test('Signup creates a new user', async () => {
    const res = await request(app).post('/signup').send({
      username: 'unittestuser',
      email: 'testuser@example.com',
      password: 'testpass123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'unittestuser');
  });

  test('Login returns JWT token', async () => {
    // Sign up first
    await request(app).post('/signup').send({
      username: 'unittestuser',
      email: 'testuser@example.com',
      password: 'testpass123',
    });

    const res = await request(app).post('/login').send({
      username: 'unittestuser',
      password: 'testpass123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('Access protected route with token', async () => {
    // Sign up and log in first
    await request(app).post('/signup').send({
      username: 'unittestuser',
      email: 'testuser@example.com',
      password: 'testpass123',
    });

    const loginRes = await request(app).post('/login').send({
      username: 'unittestuser',
      password: 'testpass123',
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Welcome');
  });

  test('Duplicate signup returns 409', async () => {
    const user = {
      username: 'dupeuser',
      email: 'dupe@example.com',
      password: 'password123',
    };

    // First signup should succeed
    await request(app).post('/signup').send(user);

    // Second signup should fail
    const res = await request(app).post('/signup').send(user);
    expect(res.statusCode).toBe(409);
    expect(res.text).toBe('Username Already Exists');
  });

  test('Login with invalid credentials returns 401', async () => {
    const res = await request(app).post('/login').send({
      username: 'nonexistent',
      password: 'wrongpass',
    });

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/Invalid|not found/i); // adjust if needed
  });

  test('Protected route with invalid token returns 403', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Invalid token');
  });

  test('Protected route without token returns 401', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Missing token');
  });
});
