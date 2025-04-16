import AccountSchema from '../schemas/user.js';
import Account from './account.js'
import db_req from '../dbrequests.js';
import { jest } from '@jest/globals';

//mock db connection 
const mockDbConnection = {
  model: jest.fn().mockReturnValue({
    findOne: jest.fn().mockResolvedValue({ username: 'testuser', email: 'test@example.com' }),
    save: jest.fn().mockResolvedValue(),
  }),
};

beforeEach(() => {
  jest.clearAllMocks();
  db_req.setDataBaseConn(mockDbConnection);
});

const testAccount = {
  username:"testuser",
  email:"test@email.com",
  password:"bestpassword",
  following:["None"],
  Blocked:["None"],
  privacyStatus:""
};

test('Testing getAccount function', async () => {
  //call getAccount on testuser
  const newAccount = await db_req.getAccount('testuser');

  //test mocked findone output
  expect(newAccount).toEqual({ username: 'testuser', email: 'test@example.com' }); 
  //check model call
  expect(mockDbConnection.model).toHaveBeenCalledWith('User', AccountSchema);
  expect(mockDbConnection.model().findOne).toHaveBeenCalledWith({ username: 'testuser' }); 
});

// this is broken because the mock doesn't construct a UserModel in the AddAccount function 
  // const accountToAdd = new userModel(account);
// needs to either mock construction or change strategy

test('Testing addAccount function', async () => {
  //call getAccount on testuser
  const savedAccount = await db_req.addAccount(testAccount);

  //test mocked save output
  expect(savedAccount).toEqual(testAccount);
  expect(mockDbConnection.model).toHaveBeenCalledWith('User', AccountSchema);
  expect(mockDbConnection.model().save).toHaveBeenCalledWith(testAccount);
});