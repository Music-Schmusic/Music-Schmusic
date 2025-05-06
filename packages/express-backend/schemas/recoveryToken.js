import mongoose from 'mongoose';

const RecoveryToken = new mongoose.Schema(
  {
    token: {
      type: String,
      unique: true,
      required: true,
    },
    expiration: {
      type: Date,
      required: true,
    },
    CRSFtoken: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { collection: 'RecoveryTokens' }
);

export default RecoveryToken;
