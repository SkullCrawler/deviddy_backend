const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);
const path = require('path');
const User = require(`../../user/models/User`);
const UserOTPVerification = require(`../models/UserVerfication`);
const sendOTPVerificationEmail = require("../../../../config/mailer");


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email regex pattern
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/; // Password regex pattern
const usernameRegex = /^[a-zA-Z0-9_.]{3,}$/; // Username regex pattern


// Endpoint to check username availability
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!usernameRegex.test(username)) {
      throw Error(`Username must be atleast 3 characters long and can only contain letters(Aa), numbers, underscore (_) or period (.)`);
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error(`Username is already taken`);
    } else {
      res.json({ 
        seccess: true, 
        message: `Username is available` 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Endpoint to check email availability and regex
const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!emailRegex.test(email)) {
      throw Error(`Invalid email format`);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error(`Email is already taken`);
    } else {
      res.json({ 
        success: true, 
        message: `Email is available` 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Endpoint to check password strenght regex
const checkPasswordStrength = async (req, res) => {
  try {
    const { password } = req.params;
    
    if (!passwordRegex.test(password)) {
      throw Error(
        `Password must contain:
          1. Atleast one lowercase letter.
          2. Atleast one uppercase letter.
          3. Atleast one number.
          4. Atleast one special character.
          5. Atleast 8 characters long.`
       );
    }else {
      res.json({ 
        success: true, 
        message: `Password is strong` 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Endpont for registering
const register = async (req, res) => {
  res.setHeader('Content-Type', 'application/json'); // Add Content-Type header

  try {
      const { fullName, username, bio, email, phoneNumber, password, emailSubject } = req.body;

      // Validate email format using regex
      if (!emailRegex.test(email)) {
          throw Error('Invalid email format');
      }

      // Check if email is already registered
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
          throw new Error('Email is already registered');
      }

      // Validate username format using regex
      if (!usernameRegex.test(username)) {
          throw Error('Username must be at least 3 characters long and can only contain letters (Aa), numbers, underscore (_) or period (.)');
      }

      // Check if username is already registered
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
          throw new Error('Username is already taken');
      }

      // Validate password using regex
      if (!passwordRegex.test(password)) {
          throw Error(
              `Password must contain:
          1. At least one lowercase letter.
          2. At least one uppercase letter.
          3. At least one number.
          4. At least one special character.
          5. At least 8 characters long.`
          );
      }

      const newUser = new User({
          fullName,
          username,
          bio,
          email,
          phoneNumber,
          password: await bcrypt.hash(password, 10),
          profilePicture: req.file.path
      });

      await newUser.save().then((result) => {
          sendOTPVerificationEmail({ email, emailSubject }, res);
      });
  } catch (error) {
      res.json({
          success: false,
          message: error.message,
      });
  }
};

 // Endpoint for OTP verification
const verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw Error(`User not found`);
    }

    const userId = user._id.toString();
    
    if (!userId || !otp) {
      throw new Error("Empty otp details are not allowed");
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({userId});
      if  (UserOTPVerificationRecords.length <= 0) {
        throw new Error("Account verification record doesn`t exist or user has been verified already. Please sign up or log in");
      }else {
        // record exists
        const firstRecord = UserOTPVerificationRecords[0]; 
        const { expiresAt, otp: hashedOTP } = firstRecord;

        if (expiresAt < Date.now()) {
        // user otp has expired
        await UserOTPVerification.deleteMany({ userId });
        throw new Error("Code has expired. Please log in again");
        } else {
            // code hasn`t expired
            // const validOTP = await bcrypt.compare(otp, hashedOTP);
            if (otp!=hashedOTP) {
                //wrong otp entered
                throw new Error("Invalid otp passed. Check your inbox");
            } else {
                //success
                const updateResult = await User.updateOne({ _id: userId }, { verified: true });
                await UserOTPVerification.deleteMany({ userId });
                  res.json({
                    success: true,
                    message: `User email verified successfully.`,
                });
            }
        }
      }
    }
  }catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};


// Endpoint for resending otp
const resendOTP = async (req, res) => {
  res.setHeader(`Content-Type`, `application/json`);
  try {
    let { email, emailSubject } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw Error(`User not found`);
    }

    const userId = user._id.toString();

    if (!userId || !email) {
      throw new Error("Emply user details are not allowed");
    } else {
      // delete existing records and resend
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ email, emailSubject }, res);
    }
  } catch (error) {
    res.json({
      false: false,
      message: error.message,
    });
  }
};

// Endpoint for logging in
const login = async (req, res, next) => {
  
  try {
    const { email, password } = req.body;

    // Find the user by email in the database
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      throw Error(`User not found. Please register.`);
    }
    const userId = user._id;

    // Check if the user is verified
    if (user.verified !== true) {
      throw new Error(`Email verification required. Please check your inbox.`);
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error(`Invalid password.`);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ 
      success: true,
      message: `Login successful.`,
      userId,
      token,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    }); // Pass the error to the error handling middleware
  }
};

// Handle Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email, emailSubject } = req.body;

    // Find the user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(`User not found`);
    }
    const userId = user._id.toString();
    // delete existing records and send email
    await UserOTPVerification.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { verified: false });
    sendOTPVerificationEmail({ email, emailSubject }, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// handle reset password
const resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(`User not found`);
    }
    const verified = user.verified;
    const userId = user._id.toString();

    if ( !newPassword) {
      throw new Error(`Please enter password`);
    }

    if(!verified){
      throw new Error(`User verification failed please try again`);
    }
    if (!passwordRegex.test(newPassword)) {
      throw new Error(`Invalid password format`);
    }
    else {
      // Compare new password with old password
      const passwordMatch = await bcrypt.compare(newPassword, user.password);
      if (passwordMatch) {
        throw new Error("New password cannot be the same as the old password.");
      }

      // Update the user`s password
      await User.findByIdAndUpdate(userId, { password: await bcrypt.hash(newPassword, 10) }); 
    }

    res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Start Email verification
const startEmailVerification = async (req, res) => {
  try {
      const { email, emailSubject } = req.body;

      const user = await User.findOne({ email: email });
      const userId = user._id.toString();

      if (!user) {
      throw new Error(`User not found`);
      }
  
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ email, emailSubject }, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
    throw new Error(`User not found`);
    }

    const userVerifiedStatus = user.verified;
    const userId = user._id.toString();

    // Check Email verification status
    if (!userVerifiedStatus) {
      throw new Error("Email not verified. Please Verify again");
    }

    // Verify Email
    await User.findByIdAndUpdate(userId, { isEmailVerified: true});

    res.json({
      success: true,
      message: "User email verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(`User not found`);
    }

    const userId = user._id.toString();

    // Input validation (enhanced)
    if (!userId || !currentPassword || !newPassword) {
      throw new Error(`Missing required fields: userId, currentPassword, and newPassword`);
    }

    // Validate current password (secure comparison)
    const currentPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!currentPasswordMatch) {
      throw new Error(`Incorrect current password`);
    }

    // Validate password using regex
    if (!passwordRegex.test(newPassword)) {
      throw new Error(`Invalid password format`);
    }

    // Compare new password with old password
    const newPasswordMatch = await bcrypt.compare(newPassword, user.password);
    if (newPasswordMatch) {
      throw new Error("New password cannot be the same as the old password.");
    }

    // Update the user`s password securely
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: `Password changed successfully`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  checkUsernameAvailability, 
  checkEmailAvailability, 
  checkPasswordStrength,
  register, 
  verifyOTP, 
  resendOTP, 
  login, 
  forgotPassword, 
  resetPassword, 
  startEmailVerification, 
  verifyEmail,
  changePassword
};