import request from 'supertest';
import app from './backend.js';
import AccountFuncs from './Functionality/account.js';
import dbrequests from './dbrequests.js';
import mailer from './mailer.js';
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

test('/accountrecovery returns 401 email mismatch', async() => {
  jest.mock('./dbrequests.js', () => ({
    getAccount: jest.fn(),
  }));

  const username = "Testuser";
  const password = "O, what a noble mind is here o'erthrown! The piteous ample entrails of this pitiful state, how they do seem to bleed and weep, as if the very fabric of our being were torn asunder by the ravages of time and fortune!";

  const reqUser = {username : username, email : "legit@legit.com", password : password };
  const mockUser = {username : username, email : "test@test.com", password : password };

  jest.spyOn(dbrequests, 'getAccount').mockImplementationOnce((username) => mockUser);

  const res = await request(app).post('/accountrecovery').send(reqUser);

  expect(res.status).toBe(401);
  expect(res.text).toBe(`Email does not match the email for user: ${username}`);
  expect(dbrequests.getAccount).toHaveBeenCalledTimes(1);
  expect(dbrequests.getAccount).toHaveBeenCalledWith(username);
});

test('/Account recovery returns recovery token successfully', async() => {
  jest.mock('./dbrequests.js', () => ({
    getAccount: jest.fn(),
    addRecoveryToken : jest.fn(),
  }));
  const email = "test";
  const username = "test";
  const user = {username : username, email : email, password : "Thou art as tedious as a twice-told tale, as dull as a butterless pancake, as dry as a lime-kiln, and as flat as a failed soufflé, and thy conversation is as vapid, and as vacuous, and as devoid of interest, as a very desert of Sahara"};

  jest.spyOn(dbrequests, 'getAccount').mockImplementationOnce((username) => user);
  jest.spyOn(dbrequests, 'addRecoveryToken').mockImplementationOnce(() => Promise.resolve());
  jest.spyOn(mailer, 'sendEmail').mockImplementationOnce();

  const res = await request(app).post('/accountrecovery').send(user);

  expect(res.status).toBe(200);
  expect(res.text).toBe(`Account recovery email has been sent to ${email}`);
  expect(dbrequests.getAccount).toHaveBeenCalledTimes(1);
  expect(dbrequests.getAccount).toHaveBeenCalledWith(username);
  expect(dbrequests.addRecoveryToken).toHaveBeenCalledTimes(1);
  expect(dbrequests.addRecoveryToken).toHaveBeenCalledWith(expect.objectContaining({
    token : expect.any(String),
    expiration: expect.any(Number),
    CRSFtoken: expect.any(String),
    user: expect.any(String),
  }));
  expect(mailer.sendEmail).toHaveBeenCalledTimes(1);
  expect(mailer.sendEmail).toHaveBeenCalledWith(email, expect.stringContaining('Click here to recover account:'), "Password Recovery");
});