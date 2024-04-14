const mongoose = require('mongoose');

const userOTPVerificationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const UserOTPVerification = mongoose.model('UserOTPVerification', userOTPVerificationSchema);
module.exports = UserOTPVerification;