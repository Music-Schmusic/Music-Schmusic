import AccountSchema from '../schemas/user.js';
import db_req from '../dbrequests.js';
import { jest } from '@jest/globals';
import mockingoose from 'mockingoose';
import mongoose from 'mongoose';

/*
This is as far as I've gotten with successful mocking, 
I'm getting a lot of tedious/confusing errors with everything else I've tried. 

I need more time to understand how to work with the other functions. 
*/

//mock db connection
const mockDbConnection = {
  model: jest.fn().mockReturnValue({
    //mock findone query
    findOne: jest
      .fn()
      .mockResolvedValue({ username: 'testuser', email: 'test@example.com' }),
    save: jest.fn().mockResolvedValue(),
  }),
};

let userModel;

beforeAll(() => {
  userModel = mongoose.model('User', AccountSchema);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
  db_req.setDataBaseConn(mockDbConnection);
});

const testAccount = {
  username: 'testuser',
  email: 'test@email.com',
  password: 'bestpassword',
  following: [],
  Blocked: [],
  privacyStatus: 'something',
};

test('Testing getAccount function', async () => {
  //call getAccount on testuser
  const newAccount = await db_req.getAccount('testuser');

  //test mocked findone output
  expect(newAccount).toEqual({
    username: 'testuser',
    email: 'test@example.com',
  });
  //check model call
  expect(mockDbConnection.model).toHaveBeenCalledWith('User', AccountSchema);
  expect(mockDbConnection.model().findOne).toHaveBeenCalledWith({
    username: 'testuser',
  });
});

test('Testing addAccount function', async () => {
  mockingoose(userModel).toReturn(testAccount, 'save');

  const savedAccount = await db_req.addAccount(testAccount);

  //test mocked save output
  expect(savedAccount).toBeTruthy();
  expect(savedAccount.username).toBe(testAccount.username);
  expect(savedAccount.email).toBe(testAccount.email);
  expect(savedAccount.password).toBe(testAccount.password);
  expect(savedAccount.following).toEqual([]);
  expect(savedAccount.blocked).toEqual([]);
  //expect(savedAccount.privacyStatus).toBe(testAccount.privacyStatus);
  expect(savedAccount).toHaveProperty('_id');
});
