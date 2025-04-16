import AccountSchema from '../schemas/user.js';
import db_req from '../dbrequests.js';
import { jest } from '@jest/globals';

/*
This is as far as I've gotten with successful mocking, 
I'm getting a lot of tedious/confusing errors with everything else I've tried. 

I need more time to understand how to work with the other functions. 
*/

//mock db connection 
const mockDbConnection = {
  model: jest.fn().mockReturnValue({
    //mock findone query
    findOne: jest.fn().mockResolvedValue({ username: 'testuser', email: 'test@example.com' }),
  }),
};

beforeEach(() => {
  jest.clearAllMocks();
  db_req.setDataBaseConn(mockDbConnection);
});

test('Testing getAccount function', async () => {
  //call getAccount on testuser
  const account = await db_req.getAccount('testuser');

  //test mocked findone output
  expect(account).toEqual({ username: 'testuser', email: 'test@example.com' }); 
  //check model call
  expect(mockDbConnection.model).toHaveBeenCalledWith('User', AccountSchema);
  expect(mockDbConnection.model().findOne).toHaveBeenCalledWith({ username: 'testuser' }); 
});
