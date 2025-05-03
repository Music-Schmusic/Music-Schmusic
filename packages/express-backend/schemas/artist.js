import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema(
  {
    spotifyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genres: [{ type: String }],
    imageUrl: { type: String },
    popularity: { type: Number },
    externalUrl: { type: String },
  },
  { collection: 'Artist' }
);

export default mongoose.model('Artist', artistSchema);
