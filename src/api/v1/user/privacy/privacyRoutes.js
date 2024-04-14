const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../../../utils/verifyToken');
const { updateSeeFollowing, updateSeeLiked, updateCommentPrivacy, updateMentionPrivacy, updateTagPrivacy } = require('./privacyController');


// Endpoint to change see following privacy
router.post('/see_following/:userId', verifyToken, updateSeeFollowing);

// Endpoint to change see liked privacy
router.post('/see_liked/:userId', verifyToken, updateSeeLiked);

// Endpoint to change comment privacy
router.post('/comment/:userId', verifyToken, updateCommentPrivacy);

// Endpoint to change mention privacy
router.post('/mention/:userId', verifyToken, updateMentionPrivacy);

// Endpoint to change tagging privacy
router.post('/tagging/:userId', verifyToken, updateTagPrivacy);

module.exports = router;