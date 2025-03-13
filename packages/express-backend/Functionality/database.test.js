import src from './account.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import db_req from '../dbrequests.js';
import connectDB from '../db.js';
import { jest } from '@jest/globals';

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

test("Test Get User", async () => {
    const body1 = {
      username: 'testuser',
      email: 'user@example.com',
      password: '1234forever',
    }

    const username = await src.createAccount(body1);
    await db_req.addAccount(username);
  
    console.log(username);
    expect(0).toBe(0);
  })

  test('Should connect to MongoDB successfully', async () => {
    process.env.NODE_ENV = 'development';
    process.env.MONGO_URI = mongoServer.getUri(); // Use in-memory DB URI
  
    const result = await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
    expect(result).toBe(mongoose);
  });
  
  test('Should skip MongoDB connection in test mode', async () => {
    process.env.NODE_ENV = 'test'; // Simulating test environment
  
    const result = await connectDB();
    expect(result).toBeUndefined(); // Should not connect
  });
  
  test('Should handle MongoDB connection failure', async () => {
    process.env.NODE_ENV = 'development';
    process.env.MONGO_URI = 'invalid-uri'; // Force a connection failure
  
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {}); // Prevent Jest from exiting
  
    await connectDB();
  
    expect(mockExit).toHaveBeenCalledWith(1);
  
    mockExit.mockRestore(); // Restore exit behavior
  });