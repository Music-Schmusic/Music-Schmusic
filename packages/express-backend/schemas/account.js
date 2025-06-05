import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    spotifyAccessToken: {
      type: String,
      required: false,
    },
    spotifyRefreshToken: {
      type: String,
      required: false,
    },
    spotifyTokenExpiresAt: {
      type: Date,
      required: false,
    },
  },
  { collection: 'Accounts' }
);

const Account = mongoose.model('Account', accountSchema);

export default Account;
