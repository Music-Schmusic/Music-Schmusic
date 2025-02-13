import db_req from "./db-requests.js"
const hash = require('crypto');
function createAccount(username, email, password, spotifyid, spotifysecret) {
  const hashed = hashPassword(password);
  const isuser = db_req.getUser(username);

  if (!isuser.length) {
    throw new Error("Username already exists")
  } else {
    return {
      username: username,
      email: email,
      password: hashed,
      spotifyid: spotifyid,
      spotifysecret: spotifysecret,
      userdata: {},
      following: [],
      blocked: [],
    }
  };
}

function hashPassword(password) {
  return hash.createHash('sha256').update(password).digest('hex');
}

function login(username, email, password) {
  const hashed = hashPassword(password);
  //if username and email in database and hashed == database.password
  //need database implemented
  //search database for user and check if password is correct
}
exports.createAccount = createAccount;
exports.hashPassword = hashPassword;
exports.login = login;
