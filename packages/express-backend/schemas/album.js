import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema(
  {
    spotifyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    releaseDate: { type: Date },
    imageUrl: { type: String },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    },
    totalTracks: { type: Number },
    externalUrl: { type: String },
  },
  { collection: 'Albums' }
);

export default mongoose.model('Album', albumSchema);
