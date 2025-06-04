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
  const target = src.hashPassword('examplePassword1!');
  const result =
    'be54fba43cbfd044155e7a681dfecd7689533452ab15df47e2f16866b102465e';
  expect(target).toBe(result);
});

test('Create account with nothing in database', async () => {
  const body = {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'examplePassword1!',
  };

  const target = await src.createAccount(body);

  expect(target).toBeDefined();
  expect(target.username).toBe(body.username);
  expect(target.email).toBe(body.email);
  expect(target.password).toBe(
    'be54fba43cbfd044155e7a681dfecd7689533452ab15df47e2f16866b102465e'
  );
});

test('Create account with user in database', async () => {
  const existinguser = {
    username: 'testuser',
    email: 'user@example.com',
    password: src.hashPassword('examplePassword1!'),
    following: [],
    blocked: [],
    privacyStatus: 'Private',
  };

  await db_req.addAccount(existinguser);

  const body = {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'examplePassword1!',
  };

  const target = await src.createAccount(body);

  expect(target).toBeDefined();
  expect(target.username).toBe(body.username);
  expect(target.email).toBe(body.email);
  expect(target.password).toBe(
    'be54fba43cbfd044155e7a681dfecd7689533452ab15df47e2f16866b102465e'
  );
});

test('Attempt to create account with username already in use', async () => {
  const existinguser = {
    username: 'testuser2',
    email: 'user@example.com',
    password: src.hashPassword('examplePassword!2'),
    following: [],
    blocked: [],
    privacyStatus: 'Private',
  };

  await db_req.addAccount(existinguser);

  const body = {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'examplePassword2!',
  };

  await expect(src.createAccount(body)).rejects.toThrow(
    'Username already exists'
  );
});

test('Attempt to create account with bad password strength', async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: 'abcdefghi',
  };
  const body2 = {
    username: 'testuser',
    email: 'user@example.com',
    password: 'abcdefghi1',
  };
  const body3 = {
    username: 'testuser',
    email: 'user@example.com',
    password: 'abcdefghi!',
  };
  const body4 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '12345678!',
  };
  const body5 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '12345678!a',
  };
  const body6 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '12345678!A',
  };

  await expect(src.createAccount(body1)).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
  await expect(src.createAccount(body2)).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
  await expect(src.createAccount(body3)).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
  await expect(src.createAccount(body4)).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
  await expect(src.createAccount(body5)).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
  await expect(src.createAccount(body6)).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
});

test('Successful login', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const account = await src.createAccount(body);

  await db_req.addAccount(account);

  const target = await src.login('testuser', '1234Forever!');
  const result = { username: 'testuser', email: 'user@example.com' };

  expect(target).toStrictEqual(result);
});

test('failed login', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };

  const account = await src.createAccount(body);

  await db_req.addAccount(account);

  await expect(src.login('testuser', '1234never!')).rejects.toThrow(
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
    password: '1234Forever!',
  };
  const user = await src.createAccount(body);
  const _account = await db_req.addAccount(user);
  await src.setPrivacyStatus('testuser', 'Public');
  const updated = await db_req.getAccount('testuser');
  expect(updated.privacyStatus).toBe('Public');
});

test('failed to set privacy status', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const user = await src.createAccount(body);
  const _account = await db_req.addAccount(user);
  await expect(src.setPrivacyStatus('testuser', 'notastatus')).rejects.toThrow(
    'Invalid Privacy state'
  );
});

test('user does not exist', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const user = await src.createAccount(body);
  const _account = await db_req.addAccount(user);
  await expect(src.setPrivacyStatus('notauser', 'Public')).rejects.toThrow(
    "User doesn't exist"
  );
});

test('Successfull follow', async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const body2 = {
    username: 'bemyfriend',
    email: 'user2@example.com',
    password: '1234Forever!',
  };

  const user1 = await src.createAccount(body1);
  const account1 = await db_req.addAccount(user1);
  const user2 = await src.createAccount(body2);
  const account2 = await db_req.addAccount(user2);
  await src.setPrivacyStatus(account1.username, 'Public');
  await src.setPrivacyStatus(account2.username, 'Public');
  const res = await src.follow(account1.username, account2.username);
  expect(res).toBe(0);
  const updated = await db_req.getAccount(user1.username);
  expect(updated.following).toStrictEqual([user2.username]);
});

test('Other set to private', async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const body2 = {
    username: 'bemyfriend',
    email: 'user2@example.com',
    password: '1234Forever!',
  };

  const user1 = await src.createAccount(body1);
  const account1 = await db_req.addAccount(user1);
  const user2 = await src.createAccount(body2);
  const account2 = await db_req.addAccount(user2);
  await src.setPrivacyStatus(account1.username, 'Public');
  await expect(
    src.follow(account1.username, account2.username)
  ).rejects.toThrow('User has account set to Private');
});
test('User does not exist', async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };

  const user1 = await src.createAccount(body1);
  const account1 = await db_req.addAccount(user1);
  await src.setPrivacyStatus(account1.username, 'Public');
  await expect(src.follow(account1.username, 'notauser')).rejects.toThrow(
    "User doesn't exist"
  );
});

test('Successfull unfollow', async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const body2 = {
    username: 'bemyfriend',
    email: 'user2@example.com',
    password: '1234Forever!',
  };

  const user1 = await src.createAccount(body1);
  const account1 = await db_req.addAccount(user1);
  const user2 = await src.createAccount(body2);
  const account2 = await db_req.addAccount(user2);
  await src.setPrivacyStatus(account1.username, 'Public');
  await src.setPrivacyStatus(account2.username, 'Public');
  await src.follow(account1.username, account2.username);
  const res = await src.unfollow(account1.username, account2.username);
  const updated = await db_req.getAccount(user1.username);
  expect(res).toBe(0);
  expect(updated.following).toStrictEqual([]);
});

test('failed unfollow', async () => {
  const body1 = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };

  const user1 = await src.createAccount(body1);
  const account1 = await db_req.addAccount(user1);

  await src.setPrivacyStatus(account1.username, 'Public');
  await expect(src.unfollow(account1.username, 'notauser')).rejects.toThrow(
    "User doesn't exist"
  );
});

test('Update password', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const user = await src.createAccount(body);
  const account = await db_req.addAccount(user);
  const updatedaccount = await src.resetPassword('testuser', '1234Never!');
  expect(account.password === updatedaccount.password).toBe(false);
});

test('Failed to update password', async () => {
  await expect(src.resetPassword('user', 'does not Matter!2')).rejects.toThrow(
    "User doesn't exist"
  );
});

test('Failed same password', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const user = await src.createAccount(body);
  const _account = await db_req.addAccount(user);
  await expect(src.resetPassword('testuser', '1234Forever!')).rejects.toThrow(
    'New password cannot be the same as the existing'
  );
});
test('Failed bad password', async () => {
  const body = {
    username: 'testuser',
    email: 'user@example.com',
    password: '1234Forever!',
  };
  const user = await src.createAccount(body);
  const _account = await db_req.addAccount(user);
  await expect(src.resetPassword('testuser', 'abcdefgh')).rejects.toThrow(
    'Password must be at least 8 characters and contain at least one uppercase and lowercase letter, one number and  one special character'
  );
});
