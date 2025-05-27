import mongoose from 'mongoose';

const WeeklyListeningSchema = new mongoose.Schema({
  username: String,
  weekStart: Date,
  durationMs: Number, // total listened that week
  lastUpdated: { type: Date, default: new Date(0) },
});

export default mongoose.model('WeeklyListening', WeeklyListeningSchema);