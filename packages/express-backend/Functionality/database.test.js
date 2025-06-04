import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import db_req from '../dbrequests.js';
import connectDB from '../db.js';
import { jest } from '@jest/globals';
import account from './account.js';
jest.setTimeout(120000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const connect = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  db_req.setDataBaseConn(connect);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return; // 1 = connected

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

test('Should connect to MongoDB successfully', async () => {
  process.env.Runtime = 'development';
  process.env.MONGO_URI = mongoServer.getUri(); // Use in-memory DB URI

  const result = await connectDB();
  expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  expect(result).toBe(mongoose);
});

test('Should skip MongoDB connection in test mode', async () => {
  process.env.Runtime = 'test'; // Simulating test environment

  const result = await connectDB();
  expect(result).toBeUndefined(); // Should not connect
});

test('Should handle MongoDB connection failure', async () => {
  process.env.Runtime = 'development';
  process.env.MONGO_URI = 'invalid-uri'; // Force a connection failure

  // Disconnect mongoose so connectDB doesn't skip connection attempt
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {}); // Prevent Jest from exiting

  await connectDB();

  expect(mockExit).toHaveBeenCalledWith(1);

  mockExit.mockRestore(); // Restore exit behavior
});
test('Add recovery token', async () => {
  process.env.Runtime = 'development';
  process.env.MONGO_URI = mongoServer.getUri(); // Use in-memory DB URI

  await connectDB();

  const token = {
    token: 'abc',
    expiration: Date.now(),
    CRSFtoken: 'cba',
    user: 'aab',
  };
  await db_req.addRecoveryToken(token);
  expect(0).toBe(0); //Should only get here if the request succeeds
});
test('get recovery token', async () => {
  process.env.Runtime = 'development';
  process.env.MONGO_URI = mongoServer.getUri(); // Use in-memory DB URI

  await connectDB();
  const date = Date.now();
  const token = {
    token: 'abc',
    expiration: date,
    CRSFtoken: 'cba',
    user: 'aab',
  };
  await db_req.addRecoveryToken(token);
  const res = await db_req.getRecoveryToken(token.token);
  expect(res.token).toBe(token.token);
  expect(res.expiration.getTime()).toBe(date);
  expect(res.CRSFtoken).toBe(token.CRSFtoken);
  expect(res.user).toBe(token.user);
});

test('delete user', async () => {
  process.env.Runtime = 'development';
  process.env.MONGO_URI = mongoServer.getUri();
  await connectDB();
  const user = await account.createAccount({
    username: 'deletemePLEASE',
    email: 'test@gmail.com',
    password: 'Password123!',
  });
  await db_req.addAccount(user);
  const res = await db_req.deleteUser({ username: user.username });
  expect(res).toBe(0);
});

test('delete token', async () => {
  process.env.Runtime = 'development';
  process.env.MONGO_URI = mongoServer.getUri();
  await connectDB();
  const token = {
    user: 'deletemePLEASE',
    token: 'test@gmail.com',
    CRSFtoken: 'AOUBSFOSDFASDAgsdfhstfjd',
    expiration: Date.now(),
  };
  await db_req.addRecoveryToken(token);
  const res = await db_req.deleteRecoveryToken({ token: token.token });
  expect(res).toBe(0);
});
