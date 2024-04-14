const mongoose = require('mongoose');

const followRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

const FollowRequest = mongoose.model('FollowRequest', followRequestSchema);
module.exports = FollowRequest;
