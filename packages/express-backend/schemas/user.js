import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
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
    privacyStatus: {
      type: String,
      required: true,
    },
  },
  { collection: 'Account' }
);

export default AccountSchema;
