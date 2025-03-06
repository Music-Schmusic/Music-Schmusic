import mongoose from 'mongoose';
import userSchema from './user.js';
import listeningDataModel from './listeningData.js';
import playlistModel from './playlist.js';

mongoose.set('debug', true);
let connection;
// MongDB Connection
function setDataBaseConn(c) {
  connection = c;
}

async function getAccount(username) {
  const usermodel = connection.model('User', userSchema);
  let user = await usermodel.findOne({ username: username });
  return user;
}

async function addAccount(account) {
  const usermodel = connection.model('User', userSchema);
  const accountToAdd = new usermodel(account);
  const user = await accountToAdd.save();
  return user;
}

async function followUser(userId, friendUsername) {
  const usermodel = connection.model('User', userSchema);
  return await usermodel.findByIdandUpdate(
    userId,
    { $addToSet: { following: friendUsername } },
    { new: true }
  );
}

async function unfollowUser(userId, friendUsername) {
  const usermodel = connection.model('User', userSchema);
  return await usermodel.findByIdAndUpdate(
    userId,
    { $pull: { following: friendUsername } },
    { new: true }
  );
}

async function addSongToBlock(userId, songId) {
  const usermodel = connection.model('User', userSchema);
  return await usermodel.findByIdAndUpdate(
    userId,
    { $addToSet: { blocked: songId } },
    { new: true }
  );
}

async function removeSongFromBock(userId, songId) {
  const usermodel = connection.model('User', userSchema);
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
};
