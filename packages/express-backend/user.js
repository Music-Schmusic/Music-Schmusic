import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email : {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    spotifyclientid: {
      type: String,
      required: true,
    },
    spotifysecret: {
      type: String,
      required: true,
    },
    following: {
      type: [String],
      required: true,
    },
    blocked: {
      type: [String],
      required: true,
    },
    userdata: {},
  },
  { collection: "Account" }
);

const User = mongoose.model("User", UserSchema);

export default User;
