import request from 'supertest';
import app from './backend.js';
import AccountFuncs from './Functionality/account.js';
import dbrequests from './dbrequests.js';
import mailer from './mailer.js';
import { jest } from '@jest/globals';

afterEach(() => {
  jest.clearAllMocks();
});

test('/signup returns unknown 400 error', async () => {
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

test('/accountrecovery returns 404 user doesnt exist', async() => {
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

test('/accountrecovery returns recovery token successfully', async() => {
  jest.mock('./dbrequests.js', () => ({
    getAccount: jest.fn(),
    addRecoveryToken : jest.fn(),
  }));
  const email = "test";
  const username = "test";
  const user = {username : username, email : email};

  jest.spyOn(dbrequests, 'getAccount').mockImplementationOnce((username) => user);
  jest.spyOn(dbrequests, 'addRecoveryToken').mockImplementationOnce(() => Promise.resolve());
  jest.spyOn(mailer, 'sendEmail').mockImplementationOnce(() => Promise.resolve());

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

test('/accountrecovery returns 500 error', async() => {
  jest.mock('./dbrequests.js', () => ({
    getAccount: jest.fn(),
    addRecoveryToken : jest.fn(),
  }));
  const email = "test";
  const username = "test";
  const user = {username : username, email : email};
  const err = new Error('failed to add recovery token');

  const getAcc = jest.spyOn(dbrequests, 'getAccount').mockImplementationOnce((username) => user);
  const addToken = jest.spyOn(dbrequests, 'addRecoveryToken').mockImplementationOnce(() => {throw err});
  const sendMsg = jest.spyOn(mailer, 'sendEmail').mockImplementationOnce(() => Promise.resolve());
  const consoleSpy = jest.spyOn(global.console, 'log');

  const res = await request(app).post('/accountrecovery').send(user);

  expect(res.status).toBe(500);
  expect(getAcc).toHaveBeenCalledTimes(1);
  expect(getAcc).toHaveBeenCalledWith(username);
  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy).toHaveBeenCalledWith("failed to add recovery token");
  expect(sendMsg).toHaveBeenCalledTimes(0);
});

test('/resetvalidation returns successful 200 response', async() => {
  jest.mock('./dbrequests.js', () => ({
    getRecoveryToken : jest.fn(),
  }));
  const token = "ABC";
  const CRSFtoken = "ABC";
  const user = "testuser";
  const expiration = new Date(2085, 1, 1); 

  const mocReq = { token : token };
  const mockRecord = {token : token, CRSFtoken : CRSFtoken, user : user, expiration : expiration};
  const getRecov = jest.spyOn(dbrequests, 'getRecoveryToken').mockImplementationOnce((token) => mockRecord);
  const res = await request(app).post('/resetvalidation').set('Cookie', [`CRSFtoken=${CRSFtoken}`]).send(mocReq);

  expect(res.status).toBe(200);
  expect(res.text).toEqual(JSON.stringify({user: user}));
  expect(getRecov).toHaveBeenCalledTimes(1);
  expect(getRecov).toHaveBeenCalledWith(token);
});

test('/resetvalidation returns 401 invalid credentials', async() => {
  jest.mock('./dbrequests.js', () => ({
    getRecoveryToken : jest.fn(),
  }));
  const token = "ABC";
  const CRSFtoken = "ABC";
  const user = "testuser";
  const expiration = new Date(2085, 1, 1); 

  const mocReq = { token : token };
  const mockRecord = {token : "different-token", CRSFtoken : CRSFtoken, user : user, expiration : expiration};
  const getRecov = jest.spyOn(dbrequests, 'getRecoveryToken').mockImplementationOnce((token) => mockRecord);
  const res = await request(app).post('/resetvalidation').set('Cookie', [`CRSFtoken=${CRSFtoken}`]).send(mocReq);

  expect(res.status).toBe(401);
  expect(res.text).toBe('Invalid Credentials');
  expect(getRecov).toHaveBeenCalledTimes(1);
  expect(getRecov).toHaveBeenCalledWith(token);
});


