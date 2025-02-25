import db_req from '../dbrequests.js';
import hash from 'crypto';
import CryptoJS from 'crypto-js';
const key = 'xG0m3tfmDgV624yOhZYW7uHTFBvLrvWUWzD+s4xXopXVNVnzB103zBU2vy57aQcs';
function createAccount(body) {
  const hashed = hashPassword(body.password);
  const isuser = db_req.getAccount(body.username);
  const encryptedsecret = CryptoJS.AES.encrypt(body.spotifySecret, key);

  return {
    username: body.username,
    email: body.email,
    password: hashed,
    spotifyId: body.spotifyId,
    spotifySecret: encryptedsecret,
    following: [],
    blocked: [],
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

export default {
  createAccount,
  hashPassword,
  login,
};
