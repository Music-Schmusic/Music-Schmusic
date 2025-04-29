import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { collection: 'Genres' }
);

export default mongoose.model('Genre', genreSchema);
