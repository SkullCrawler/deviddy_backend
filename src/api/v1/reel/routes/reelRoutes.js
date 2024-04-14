const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { likeReel, uploadReel, shareReel, downloadReel, deleteReel, saveReel, updateReel, getReels, repostReel, getReelComments } = require('../controllers/reelController');
const { verifyToken } = require('../../../../utils/verifyToken');

// Define storage options
const storage = multer.diskStorage({
    destination: 'public/uploads/reels/',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const ext = path.extname(file.originalname); // Extracting original extension
      cb(null, `reelFilePath-${uniqueSuffix}${ext}`); // Combining custom filename with extension
    }
  });
  
  // Create multer instance with custom storage
  const upload = multer({ storage: storage });



// Endpoint to like a reel
router.post('/like/:reelId/:userId', likeReel);

// Endpoint to save a reel
router.post('/save/:reelId/:userId', saveReel);

// Endpoint to upload a reel
router.post('/upload', upload.single('file'), verifyToken, uploadReel);

// Endpoint to get All Reels
router.get('/get/:userId', getReels);

// Endpoint to get reel comments
router.get('/get_comments/:reelId', getReelComments);

// Endpoint to update a reel
router.post('/update/:reelId/:userId', verifyToken, updateReel);

// Endpoint to share a reel
router.get('/share/:reelId/:userId', shareReel);

// Endpoint to repost a reel
router.get('/repost/:reelId/:userId', repostReel);

// Endpoint for downloading reels
router.get('/download/:reelId', downloadReel);

// Endpoint for deleting a reel
router.delete('/delete/:reelId/:userId', verifyToken, deleteReel);

module.exports = router;