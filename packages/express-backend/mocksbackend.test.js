import request from 'supertest';
import app from './backend.js';
import AccountFuncs from './Functionality/account.js';
import dbrequests from './dbrequests.js';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.clearAllMocks();
});

test('Signup returns unknown 400 error', async () => {
  jest.mock('./Functionality/account.js', () => ({
  createAccount: jest.fn(),
  }));

  const signupError = new Error("Unknown Signup Error"); 
  jest.spyOn(AccountFuncs, 'createAccount').mockImplementationOnce(() => {
    throw signupError;
  });

  const res = await request(app).post('/signup').send({
    username: 'unittestuser',
    email: 'testuser@example.com',
    password: 'testpass123',
  });
  expect(res.status).toBe(400);
  expect(res.text).toBe(signupError.message);
});

test('/Accountrecovery returns 404 user doesnt exist', async() => {
  //mock db_req.get account() -> returns user null
  jest.mock('./dbrequests.js', () => ({
    getAccount: jest.fn(),
  }));
  const username = "fakeusername";
  const password = "abc";

  jest.spyOn(dbrequests, 'getAccount').mockImplementationOnce((username) => null);

  const res = await request(app).post('/accountrecovery').send({
    username: username,
    password: password,
  });

  expect(res.status).toBe(404);
  expect(res.text).toBe('User fakeusername does not exist');
  expect(dbrequests.getAccount).toHaveBeenCalledTimes(1); 
  expect(dbrequests.getAccount).toHaveBeenCalledWith(username);
});
