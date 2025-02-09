<<<<<<<< HEAD:packages/express-backend/account.js
const hash = require('crypto');

function createAccount(username, email, password, spotify, spotifypassword) {
  const hashed = hashPassword(password);
  const spotifykey = 'unimplemented';
========
const hash = require("crypto");

function createAccount(username, email, password, spotify, spotifypassword) {
  const hashed = hashPassword(password);
  const spotifykey = "unimplemented";
>>>>>>>> 29fdfe095eaa78dbfd988b7edbfae85d82f880e5:packages/helperfuncs/account.js
  return {
    username: username,
    email: email,
    password: hashed,
    spotifykey: spotifykey,
    userdata: [],
  };
}

function hashPassword(password) {
<<<<<<<< HEAD:packages/express-backend/account.js
  return hash.createHash('sha256').update(password).digest('hex');
}

function login(username, email, password) {
========
  return hash.createHash("sha256").update(password).digest('hex');
}

function login(username, email, password) {
  hashed = hashPassword(password)
  //if username and email in database and hashed == database.password
>>>>>>>> 29fdfe095eaa78dbfd988b7edbfae85d82f880e5:packages/helperfuncs/account.js
  //need database implemented
  //search database for user and check if password is correct
}

<<<<<<<< HEAD:packages/express-backend/account.js
exports.createAccount = createAccount;
exports.hashPassword = hashPassword;
========
exports.createAccount = createAccount
exports.hashPassword = hashPassword
>>>>>>>> 29fdfe095eaa78dbfd988b7edbfae85d82f880e5:packages/helperfuncs/account.js
