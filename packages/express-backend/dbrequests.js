import mongoose from 'mongoose';
import listeningDataModel from './schemas/listeningData.js';
import playlistModel from './schemas/playlist.js';
import connectDB from './db.js';
import AccountSchema from './schemas/user.js';
import RecoveryToken from './schemas/recoveryToken.js';

mongoose.set('debug', true);

let dbConnection;

// Allow injection of test DB connection
function setDataBaseConn(c) {
  dbConnection = c;
}

// Helper: get connection depending on mode
function getdbcon() {
  if (dbConnection) return dbConnection;
  return connectDB();
}

async function getAccount(username) {
  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);
  return await userModel.findOne({ username });
}

async function addAccount(account) {
  //const db = await getdbcon();
  const userModel = mongoose.model('User', AccountSchema);
  const accountToAdd = new userModel(account);
  return await accountToAdd.save();
}

async function addRecoveryToken(token) {
  const db = await getdbcon();
  const tokenModel = db.model('RecoveryTokens', RecoveryToken);
  const tokenToAdd = new tokenModel(token);
  return await tokenToAdd.save();
}

async function getRecoveryToken(token) {
  const db = await getdbcon();
  const tokenModel = db.model('RecoveryTokens', RecoveryToken);
  return await tokenModel.findOne({ token });
}

async function followUser(username, friendUsername) {
  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);
  return await userModel.findOneAndUpdate(
    { username },
    { $addToSet: { following: friendUsername } },
    { new: true }
  );
}

async function unfollowUser(username, friendUsername) {
  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);
  return await userModel.findOneAndUpdate(
    { username },
    { $pull: { following: friendUsername } },
    { new: true }
  );
}

async function setPrivacyState(username, status) {
  if (status !== 'Public' && status !== 'Private') {
    throw new Error('Invalid Privacy state');
  }

  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);
  const user = await getAccount(username);
  if (!user) {
    throw new Error("User doesn't exist");
  }
  const updated = await userModel.updateOne(
    { username },
    { privacyStatus: status }
  );
  return updated;
}

async function updatePassword(username, newpassword) {
  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);
  const updated = await userModel.updateOne(
    { username },
    { password: newpassword }
  );
  return updated;
}

async function deleteUser(username) {
  const db = await getdbcon();
  const usermodel = db.model('User', AccountSchema);
  await usermodel.deleteOne(username);
}

export default {
  getAccount,
  addAccount,
  followUser,
  unfollowUser,
  addRecoveryToken,
  getRecoveryToken,
  setDataBaseConn,
  setPrivacyState,
  updatePassword,
  deleteUser,
};
