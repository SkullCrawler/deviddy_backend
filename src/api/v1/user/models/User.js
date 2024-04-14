const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  fullName: String,
  verified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  bio: { type: String, required: true },
  profilePicture: { type: String, required: false },
  likes: { type: Number, default: 0 },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  privateReels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  savedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  savedPrivacy: { type: Boolean, default: false },
  likedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  repostedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  isPrivate: { type: Boolean, default: false },
  seeFollowing: { type: Boolean, default: false },
  seeLiked: { type: Boolean, default: false },
  commentPrivacy: { type: String, enum: ['everyone', 'followersThatFollow', 'noOne'], default: 'everyone' },
  mentionPrivacy: { type: String, enum: ['everyone', 'following', 'followersThatFollow', 'noOne'], default: 'everyone' },
  tagPrivacy: { type: String, enum: ['everyone', 'following', 'followersThatFollow', 'noOne'], default: 'everyone' },
},{timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;


