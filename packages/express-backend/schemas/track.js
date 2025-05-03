import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    spotifyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    durationMs: { type: Number },
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    artistId: { type: mongoose.Schema.ObjectId, ref: 'Artist' },
    previewUrl: { type: String },
    popularity: { type: String },
    externalUrl: { type: String },
  },
  { collection: 'Tracks' }
);

export default mongoose.model('Track', trackSchema);
