const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, required: true },
  tags: [{type: String}],
  taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mentionedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reelFilePath: { type: String, required: true },  // Path to the Reel file on the server
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downloads: { type: Number, default: 0 },
  downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: { type: Number, default: 0 },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  reposts: { type: Number, default: 0 },
  repostedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  isPrivate: { type: Boolean, default: false },
});
const Reel = mongoose.model('Reel', reelSchema);

module.exports = Reel;
