import db_req from '../dbrequests.js';
import hash from 'crypto';
async function createAccount(body) {
  const hashed = hashPassword(body.password);
  const isuser = await db_req.getAccount(body.username);

  if (isuser === null) {
    return {
      username: body.username,
      email: body.email,
      password: hashed,
      following: [],
      blocked: [],
      privacyStatus: 'Private',
    };
  } else {
    throw new Error('Username already exists');
  }
}

function hashPassword(password) {
  return hash.createHash('sha256').update(password).digest('hex');
}

async function login(username, password) {
  const user = await db_req.getAccount(username);
  if (!user) {
    throw new Error('Invalid username or email.');
  }
  const hashedInputPassword = hash
    .createHash('sha256')
    .update(password)
    .digest('hex');
  if (hashedInputPassword !== user.password) {
    throw new Error('Invalid password.');
  }
  console.log('Login successful:', user.username);
  return { username: user.username, email: user.email };
}

async function follow(self, username) {
  //Assumes self will be supplied by front end and will never not exist since
  //user has to be logged in in order to follows others
  const tobefollowed = await db_req.getAccount(username);
  if (!tobefollowed) {
    throw new Error("User doesn't exist");
  }
  if (tobefollowed.privacyStatus === 'Public') {
    await db_req.followUser(self, username);
    return 0;
  } else {
    throw new Error('User has account set to Private');
  }
}

async function unfollow(self, username) {
  //for the same reason as before self doesn't have to be checked
  const tobeunfollowed = await db_req.getAccount(username);
  if (!tobeunfollowed) {
    throw new Error("User doesn't exist");
  }
  await db_req.unfollowUser(self, username);
  return 0;
}

async function setPrivacyStatus(username, status) {
  await db_req.setPrivacyState(username, status);
}

export default {
  createAccount,
  hashPassword,
  login,
  follow,
  setPrivacyStatus,
  unfollow,
};
