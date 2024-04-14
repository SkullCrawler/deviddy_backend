const express = require('express'); 
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { checkUsernameAvailability, checkEmailAvailability, resendOTP, verifyOTP, register, login, forgotPassword, resetPassword, changePassword, startEmailVerification, verifyEmail, checkPasswordStrength } = require('../controllers/authController');

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

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// Endpont to check username
router.get('/check_username/:username', checkUsernameAvailability);

// Endpont to check username
router.get('/check_email/:email', checkEmailAvailability);

// Endpont to check password
router.get('/check_password/:password', checkPasswordStrength);

// Endpont for registering
router.post('/register', upload.single('file'), register);

 // Endpoint for OTP verification
router.post("/verify_otp", verifyOTP);

// Endpoint for resending otp
router.post("/resend_otp", resendOTP);

// Endpoint for logging in
router.post('/login', login);

// Endpoint for forgot password
router.post('/forgot_password', forgotPassword);

// Endpoint for reset password
router.post('/reset_password', resetPassword);

// Endpoint to start email verification
router.post('/start_email_verification', startEmailVerification);

// Endpoint to verify email
router.post('/verify_email', verifyEmail);

// Endpoint to change password
router.post('/change_password', changePassword);

module.exports = router;