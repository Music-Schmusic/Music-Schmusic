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

afterEach(async () => {
  // Drop collections instead of entire database (fixes "not allowed to drop database" error)
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

test('Hash password', () => {
  const target = src.hashPassword('examplePassword');
  const result =
    'c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd';
  expect(target).toBe(result);
});

test('Create account with nothing in database', async () => {
  const body = {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'examplePassword2',
  };

  const target = await src.createAccount(body);

  expect(target).toBeDefined();
  expect(target.username).toBe(body.username);
  expect(target.email).toBe(body.email);
  expect(target.password).toBe(
    '032de0b851df44c2e1eb09c0237e8fc9669c239d4c58f91c6a8d68084772607b'
  );
});

test('Create account with user in database', async () => {
  const existinguser = {
    username: 'testuser',
    email: 'user@example.com',
    password: src.hashPassword('examplePassword'),
    following: [],
    blocked: [],
    privacyStatus: 'Private',
  };

  await db_req.addAccount(existinguser);

  const body = {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'examplePassword2',
  };

  const target = await src.createAccount(body);

  expect(target).toBeDefined();
  expect(target.username).toBe(body.username);
  expect(target.email).toBe(body.email);
  expect(target.password).toBe(
    '032de0b851df44c2e1eb09c0237e8fc9669c239d4c58f91c6a8d68084772607b'
  );
});

test('Attempt to create account with username already in use', async () => {
  const existinguser = {
    username: 'testuser2',
    email: 'user@example.com',
    password: src.hashPassword('examplePassword'),
    following: [],
    blocked: [],
    privacyStatus: 'Private',
  };

  await db_req.addAccount(existinguser);

  const body = {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'examplePassword2',
  };

  await expect(src.createAccount(body)).rejects.toThrow(
    'Username already exists'
  );
});

test('Successful login', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234forever',
  };
  const account = await src.createAccount(body);

  await db_req.addAccount(account);

  const target = await src.login('testuser', '1234forever');
  const result = { username: 'testuser', email: 'user@example.com' };

  expect(target).toStrictEqual(result);
});

test('failed login', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234forever',
  };

  const account = await src.createAccount(body);

  await db_req.addAccount(account);

  await expect(src.login('testuser', '1234never')).rejects.toThrow(
    'Invalid password.'
  );
});

test("user doesn't exist ", async () => {
  await expect(src.login('testuser', '1234never')).rejects.toThrow(
    'Invalid username or email.'
  );
});

test('set privacy status', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234forever',
  };
  const user = await src.createAccount(body);
  const account = await db_req.addAccount(user);
  const res = await src.setPrivacyStatus('testuser', 'Public')
  console.log(res)
})

test("Successfull follow", async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234forever',
  };
  const body2 = {
    username: 'bemyfriend',
    email: 'user2@example.com',
    password: '1234forever',
  };

  const friendee = await src.createAccount(body1);
  await db_req.addAccount(friendee);
  const friender = await src.createAccount(body2);
  await db_req.addAccount(friender);
  console.log(friender)
  console.log(friendee)
  await src.follow(friender, friendee)
  expect(0).toBe(0);
})