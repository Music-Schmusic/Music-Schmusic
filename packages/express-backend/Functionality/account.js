<<<<<<< Updated upstream
import db_req from "./db-requests.js"
const hash = require('crypto');
function createAccount(username, email, password, spotifyid, spotifysecret) {
  const hashed = hashPassword(password);
  const isuser = db_req.getUser(username);

  if (!isuser.length) {
    throw new Error("Username already exists")
  } else {
=======
import db_req from "../dbrequests.js"
import hash from 'crypto'
import CryptoJS from 'crypto-js'
const key = "WCSXIu9EzhbquJRdYaK+7eS2S37bCKa0r1s7rfYms4V+uk5sv94xJvm6fIil7ubR"
function createAccount(body) {
  const hashed = hashPassword(body.password);
  const isuser = db_req.getAccount(body.username);
  const encryptedsecret = CryptoJS.AES.encrypt(body.spotifySecret, key)

  if (!isuser.length) {
>>>>>>> Stashed changes
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
