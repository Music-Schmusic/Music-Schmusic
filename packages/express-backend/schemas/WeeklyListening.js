import mongoose from 'mongoose';

const WeeklyListeningSchema = new mongoose.Schema({
  username: String,
  weekStart: Date,
  durationMs: Number, // total listened that week
});

export default mongoose.model('WeeklyListening', WeeklyListeningSchema);