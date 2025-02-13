const src = require('./account.js');

test('Hash password', () => {
  const target = src.hashPassword('examplePassword');
  const result =
    'c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd';
  expect(target).toBe(result);
});

test('Create account', () => {
  const target = src.createAccount(
    'testuser',
    'user@example.com',
    'examplePassword',
    'spotify',
    'spotifypassword'
  );
  const result = {
    username: 'testuser',
    email: 'user@example.com',
    password:
      'c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd',
    spotifykey: 'unimplemented',
    userdata: [],
  };
  expect(target).toStrictEqual(result);
});
