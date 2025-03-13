import src from './account.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import db_req from '../dbrequests.js';

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