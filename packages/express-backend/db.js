import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (process.env.Runtime === 'test') {
    console.log('Skipping MongoDB connection in test mode.');
    return;
  }

  // Prevent multiple connections
  if (mongoose.connection.readyState !== 0) {
    console.log('MongoDB already connected. Skipping reconnect.');
    return mongoose;
  }

  try {
    console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return mongoose;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
