import mongoose from "mongoose";
import userModel from "./user.js";
import connectDB from './db.js'; // Import the database connection function

mongoose.set("debug", true);

// Connect to MongoDB
connectDB();

function getUser(username) {
  let promise = userModel.find({ username: username });
  return promise;
};

export default {
  getUser
}