const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../../../../utils/verifyToken');
const { followUser, respondToRequest, unfollowUser } = require('../controllers/followController');

// Route to send a follow request
router.post('/send_request', verifyToken, followUser);

// Route to accept/reject a follow request
router.post('/respond_to_request', verifyToken, respondToRequest);

// Route to unfollow a user
router.post('/unfollow_request', verifyToken, unfollowUser);

module.exports = router;
