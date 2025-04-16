import mongoose from 'mongoose';

const UserTokens = new mongoose.Schema(
  {
	username: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	  },
	refresh_token: {
		type : String,
		required : true, 
		trim : true
	},
	access_token: {
	  	type: String,
	  	required: true,
	  	trim: true,
	}
  },
  { collection: 'UserTokens' }
);

export default UserTokens;