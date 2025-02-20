import mongoose from "mongoose";
import userModel from "./user.js";
import connectDB from './db.js'; // Import the database connection function

mongoose.set("debug", true);

// Connect to MongoDB
connectDB();

function getAccount(username) {
  let promise = userModel.findOne({ username: username });
  return promise;
};

function addAccount(account) {
  const accountToAdd = new userModel(account);
  const promise = accountToAdd.save();
  return promise;
};

export default {
  getAccount,
  addAccount,
}