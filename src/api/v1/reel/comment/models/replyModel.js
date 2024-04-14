const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentionedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
