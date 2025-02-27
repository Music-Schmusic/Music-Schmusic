import mongoose from 'mongoose';

// trackid, artistid, albumid, timestamp, duration

const listeningDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    trackId: {
      type: String,
      required: true,
    },
    artistId: {
      type: String,
      required: true,
    },
    albumId: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
    },
  },
  { collection: 'ListeningData' }
);

const ListeningData = mongoose.model('ListeningData', listeningDataSchema);

export default ListeningData;
