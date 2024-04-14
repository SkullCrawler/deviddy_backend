const express = require('express'); 
const router = express.Router();
const { verifyToken } = require('../../../../../utils/verifyToken');
const { comment, replyToComment, likeCommentReply, deleteEntity } = require('../controllers/commentController');


// Route to add a comment
router.post('/:reelId/:userId', verifyToken, comment);  

// Route to add a reply to a comment
router.post('/reply/:commentId/:userId', verifyToken, replyToComment);

// Route to like a comment/reply
router.post('/like/:entityId/:entityType', verifyToken, likeCommentReply);

// Route to delete a comment/reply
router.delete('/delete/:entityId/:entityType', verifyToken, deleteEntity);


module.exports = router;