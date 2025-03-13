import mongoose from 'mongoose';
import listeningDataModel from './schemas/listeningData.js';
import playlistModel from './schemas/playlist.js';
import connectDB from './db.js';
import AccountSchema from './schemas/user.js';

mongoose.set('debug', true);
let dbConnection;
// MongDB Connection
function setDataBaseConn(c) {
  dbConnection = c;
}

function getdbcon() {
  if (dbConnection === undefined) {
    dbConnection = connectDB();
  }
  return dbConnection;
}

async function getAccount(username) {
  const db = await getdbcon();
  const usermodel = db.model('User', AccountSchema);
  let user = await usermodel.findOne({ username: username });
  return user;
}

async function addAccount(account) {
  const db = await getdbcon();
  const usermodel = db.model('User', AccountSchema);
  const accountToAdd = new usermodel(account);
  const user = await accountToAdd.save();
  return user;
}

async function followUser(username, friendUsername) {
  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);

  // Update following list
  const updatedUser = await userModel.findOneAndUpdate(
    { username },
    { $addToSet: { following: friendUsername } },
    { new: true }
  );

  return updatedUser;
}

async function unfollowUser(username, friendUsername) {
  const db = await getdbcon();
  const userModel = db.model('User', AccountSchema);

  // Update following list
  const updatedUser = await userModel.findOneAndUpdate(
    { username },
    { $pull: { following: friendUsername } },
    { new: true }
  );
  return updatedUser;
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
  await userModel.updateOne({ username }, { privacyStatus: status });
}

/*

EVERYTHING BELOW THIS POINT WILL NOT BE HAVE TEST CASES SINCE THEY WILL ALMOST CERTAINLY CHANGE
AFTER WE START MAKING SPOTIFY REQUESTS

*/
async function addSongToBlock(userId, songId) {
  const db = await getdbcon();
  const usermodel = db.model('User', AccountSchema);
  return await usermodel.findByIdAndUpdate(
    userId,
    { $addToSet: { blocked: songId } },
    { new: true }
  );
}

async function removeSongFromBock(userId, songId) {
  const db = await getdbcon();
  const usermodel = db.model('User', AccountSchema);
  return await usermodel.findByIdAndUpdate(
    userId,
    { $pull: { blocked: songId } },
    { new: true }
  );
}

//creating a listening data schema. (may need to be changed depending on how we store data)

function getSpotifyStatistics(userId, startDate, endDate) {
  return listeningDataModel.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    //need to decide on stats we want to return
  ]);
}

async function createPlaylistFromListening(
  userId,
  startDate,
  endDate,
  playlistName
) {
  const listeningData = await listeningDataModel.find({
    userId: mongoose.Types.ObjectId(userId),
    timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
  });

  const trackIds = listeningData.map((item) => item.trackId);
  const uniqueTrackIds = [...new Set(trackIds)];

  const newPlaylist = new playlistModel({
    userId,
    name: playlistName,
    tracks: uniqueTrackIds,
    createdAt: new Date(),
  });
  return newPlaylist.save();
}

async function getRecommendations(userId, limit = 5) {
  const recommendations = await listeningDataModel.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$artistId',
        playCount: { $sum: 1 },
      },
    },
    { $sort: { playCount: -1 } },
    { $limit: limit },
  ]);
  return recommendations;
}

// temporary: need to add more stats
async function getUserStatistics(userId) {
  const totalListens = await listeningDataModel.countDocuments({
    userId: mongoose.Types.ObjectId(userId),
  });
  const distinctArtists = await listeningDataModel.distinct('artistId', {
    userId: mongoose.Types.ObjectId(userId),
  });
  return {
    totalListens,
    distinctArtists: distinctArtists.length,
  };
}

/* (general model) not sure how we will implement playlist covers. request here in case we implement it elsewhere. to be changed in the future
function updatePlaylistCover(playlistId, coverUrl) {
  return playlistModel.findByIdAndUpdate(
    playlistId, 
    { coverUrl: coverUrl },
    { new : true }
  );
}
*/

export default {
  getAccount,
  addAccount,
  followUser,
  unfollowUser,
  addSongToBlock,
  removeSongFromBock,
  getSpotifyStatistics,
  createPlaylistFromListening,
  getRecommendations,
  getUserStatistics,
  setDataBaseConn,
  setPrivacyState,
};
