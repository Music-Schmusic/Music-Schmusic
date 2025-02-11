const hash = require('crypto');

function createAccount(username, email, password, spotify, spotifypassword) {
  const hashed = hashPassword(password);
  const spotifykey = 'unimplemented';
  return {
    username: username,
    email: email,
    password: hashed,
    spotifykey: spotifykey,
    userdata: [],
  };
}

function hashPassword(password) {
  return hash.createHash('sha256').update(password).digest('hex');
}

function login(username, email, password) {
  //need database implemented
  //search database for user and check if password is correct
}

exports.createAccount = createAccount;
exports.hashPassword = hashPassword;
