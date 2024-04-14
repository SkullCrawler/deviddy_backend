const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../../../../utils/verifyToken');
const { getProfile, updateBio, shareProfile, addFriends, profileViews, uploadedReels, savedPosts, privatePosts, likedPosts, blockUser, repostedReels, seeFollowers, seeFollowing, updateUserName, changeEmail, verifyEmailChange, getAllUsers, searchUsers, updateProfilePicture, getProfilePicture } = require('../controllers/userController');


// Define storage options
const storage = multer.diskStorage({
    destination: 'public/uploads/profilePics/',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const ext = path.extname(file.originalname); // Extracting original extension
      cb(null, `profilePicFilePath-${uniqueSuffix}${ext}`); // Combining custom filename with extension
    }
  });
  
// Create multer instance with custom storage
const upload = multer({ storage: storage });


// Get Profile Route
router.get('/get_profile/:userId' , getProfile);

// Get All Users Route
router.get('/get_all' , getAllUsers);

// Search for users
router.get('/search/:username' , searchUsers);

// Update user_bio Route
router.post('/update_bio/:userId', verifyToken, updateBio);

// Update user_username Route
router.post('/change_email', verifyToken, changeEmail);

// Update user_bio Route
router.post('/verify_email_change', verifyToken, verifyEmailChange);

// Update user_username Route
router.post('/update_username/:userId', verifyToken, updateUserName);

// Update user profile picture Route
router.post('/update_profile_pic/:userId', upload.single('file'), verifyToken, updateProfilePicture);

// Get uploaded Reels/Posts Route
router.get('/uploaded/:userId', uploadedReels);

// Get saved posts Route
router.get('/saved/:userId', verifyToken, savedPosts);

// Get profile Picture Route
router.get('/get_profile_picture/:userId', getProfilePicture);

// Get private posts Route
router.get('/private/:userId', verifyToken, privatePosts);

// Get liked posts Route
router.get('/liked/:userId/:requesterId', verifyToken, likedPosts);

// Get reposted reels Route
router.get('/reposted/:userId', verifyToken, repostedReels);

// Get profile views Route
router.get('/profile_views/:userId', verifyToken, profileViews);

// Get followers Route
router.get('/see_followers/:userId', verifyToken, seeFollowers);

// Get following Route
router.get('/see_following/:userId/:requesterId', verifyToken, seeFollowing);

// Share Profile Route
router.get('/share/:userId', shareProfile);

// Block User Route
router.post('/block/:userId/:blockedUserId', verifyToken, blockUser);

// Add Friend Route
router.post('/add_friend/:userId/:friendId', verifyToken, addFriends);


module.exports = router;