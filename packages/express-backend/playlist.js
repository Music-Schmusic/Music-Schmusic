import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tracks: [
      {
        type: String,
        required: true,
      },
    ],
    coverUrl: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'Playlists' }
);

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
