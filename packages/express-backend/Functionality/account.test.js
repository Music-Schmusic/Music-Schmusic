import src from './account.js'


test('Hash password', () => {
  const target = src.hashPassword('examplePassword');
  const result =
    'c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd';
  expect(target).toBe(result);
});

test('Create account', () => {
  const body = {
    spotifyId: 'spotify',
    spotifySecret: 'spotifypassword',
    username: 'testuser',
    email: 'user@example.com',
    password: 'examplePassword',
  }
  const target = src.createAccount(body);
  const result = {
    username: 'testuser',
    email: 'user@example.com',
    password:
      'c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd',
    spotifyId: 'spotify',
    spotifySecret: 'spotifypassword',
    following: [],
    blocked: [],
  };
  expect(target).toStrictEqual(result);
});
