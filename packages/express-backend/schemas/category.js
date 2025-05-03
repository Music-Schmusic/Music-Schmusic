import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    spotifyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    iconUrl: { type: String },
  },
  { collection: 'Categories' }
);

export default mongoose.model('Category', categorySchema);
