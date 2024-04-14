const fs = require('fs');
const path = require('path');
const sendOTPVerificationEmail = require("../../../../config/mailer");
const UserOTPVerification = require("../../auth/models/UserVerfication");
const User = require(`../models/User`);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// Fetch user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select(`-password`);
        if (!user) {
            throw Error(`User not found`);
        }
        res.status(200).json({
            success: true,
            message: `User Profile`,
            user: user
        });
    } catch (error) {
        res.json({ 
            success: false,
            message: error.message
         });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        if (!users || users.length === 0) {
            throw Error('No users found');
        }
        res.status(200).json({
            success: true,
            message: 'All Users',
            users: users
        });
    } catch (error) {
        res.json({ 
            success: false,
            message: error.message
         });
    }
};

// Search for Users
const searchUsers = async (req, res) => {
    try {
        const username = req.params.username;
        const users = await User.find({ username: { $regex: username, $options: 'i' } }).select('-password');
        if (!users || users.length === 0) {
            throw Error('No users found with the provided username');
        }
        res.status(200).json({
            success: true,
            message: `Users with username: ${username}`,
            users: users
        });
    } catch (error) {
        res.json({ 
            success: false,
            message: error.message
         });
    }
};


// Update user bio
const updateBio = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { bio } = req.body;

        // Update user profile
        await User.findByIdAndUpdate(userId, { bio: bio });
        res.status(200).json({ 
            success: true, 
            message: `User profile updated successfully`,
            data: {
                bio: bio
            } 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update username
const updateUserName = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { username } = req.body;

        // Update user profile
        await User.findByIdAndUpdate(userId, { username: username });
        res.status(200).json({ 
            success: true, 
            message: `User profile updated successfully`,
            data: {
                username: username
            } 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};


// change profilePicture
const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.params.userId;
        const profilePicture = req.file.path;

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userProfilePicture = user.profilePicture;

        const previousImagePath = path.join(__dirname, '..', '..', '..', '..', '..', userProfilePicture);

        // Delete previous profile picture if exists
        if (user.profilePicture) {
            if (fs.existsSync(previousImagePath)) {
                fs.unlinkSync(previousImagePath);
            }
        }

        // Update user profile picture
        await User.findByIdAndUpdate(userId, { profilePicture: profilePicture });
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Profile picture updated successfully',
            data: { 
                profilePicture: profilePicture
            } 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Change user email
const changeEmail = async (req, res) => {
    try {
        const { currentEmail, newEmail, emailSubject } = req.body;

        const user = await User.findOne({ email: currentEmail });
        const userId = user._id.toString();

        if (!user) {
        throw new Error(`User not found`);
        }


        if (newEmail == currentEmail) {
        throw new Error("New email cant be same as current email");
        }
    
        
        await UserOTPVerification.deleteMany({ userId });
        await User.findByIdAndUpdate(userId, { isEmailVerified: false });
        sendOTPVerificationEmail({ email: newEmail, emailSubject }, res);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
};

// verify user email change
const verifyEmailChange = async (req, res) => {
    try {
      const { currentEmail, newEmail } = req.body;
  
      const user = await User.findOne({ email: currentEmail });
      if (!user) {
      throw new Error(`User not found`);
      }

      const userId = user._id.toString();

      // Validate email format using regex
      if (!emailRegex.test(newEmail)) {
        throw Error(`Invalid email format`);
      }
  
      // Compare new email with old email
      if (newEmail === user.email) {
        throw new Error("New email cannot be the same as the old email");
      }
  
      // Update user's email address
      await User.findByIdAndUpdate(userId, { isEmailVerified: true, email: newEmail});
  
      res.json({
        success: true,
        message: "Email address changed successfully",
      });
    } catch (error) {
      res.json({
        success: false,
        message: error.message,
      });
    }
};
  
// Get profile picture
const getProfilePicture = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if user has a profile picture
        if (!user.profilePicture) {
            const picUrl = `${req.protocol}://${req.get('host')}/public/assets/default-profile-picture.jpg`;

            res.json({
                success: true,
                message: `Profile picture for ${userId}`,
                profilePicture: picUrl
            });
            
        }else {
            const profilePicturePath = user.profilePicture.replace(/\\/g, '/');
            const picUrl = `${req.protocol}://${req.get('host')}/${profilePicturePath}`;
            res.json({
                success: true,
                message: `Profile picture for ${userId}`,
                profilePicture: picUrl
            });
        }
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get Uploaded Posts/reeels
const uploadedReels = async (req, res) => {
    try{
        const userId = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.reels.length === 0) {
                throw new Error(`User has no reels`);
            } else {
                res.json({
                    success: true,
                    message: `User's uploaded reels`,
                    reels: userProfile.reels
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message 
        });
    }
};


// Get private posts
const privatePosts = async (req, res) => {
    try{
        const userId = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.privateReels.length === 0) {
                throw new Error(`User has no private posts`);
            } else {
                res.json({
                    success: true,
                    message: `User's private post`,
                    reels: userProfile.privateReels
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message 
        });
    }
};


// Get saved  posts
const savedPosts = async (req, res) => {
    try{
        const userId = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.savedReels.length === 0) {
                throw new Error(`User has no saved posts`);
            } else {
                res.json({
                    success: true,
                    message: `User's saved posts`,
                    reels: userProfile.savedReels
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message 
        });
    }
};

// Get Liked Posts
const likedPosts =  async (req, res) => {
    try{
        const { userId , requesterId} = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.likedReels.length === 0) {
                throw new Error(`User has no liked posts`);
            }
            const seeLiked = userProfile.seeLiked
            if (seeLiked && requesterId !== userProfile._id) {
                throw new Error(`User's liked posts are private`);
            } else {
                res.json({
                    success: true,
                    message: `User's Liked posts`,
                    reels: userProfile.likedReels
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message 
        });
    }
};

// Get Reposted Reels
const repostedReels =  async (req, res) => {
    try{
        const userId = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.repostedReels.length === 0) {
                throw new Error(`User has no reposted reel`);
            } else {
                res.json({
                    success: true,
                    message: `User's reposted reels`,
                    reels: userProfile.repostedReels
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message 
        });
    }
};

// Get Profile Views
const profileViews = async (req, res) => {
    try{
        const userId = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.likes === 0 && userProfile.followers.length === 0 && userProfile.following.length === 0) {
                res.json({
                    success: true,
                    message: `Profile ${userProfile} views.`,
                    data: {
                        likes: 0,
                        followers: 0,
                        following: 0
                    }
                });
            } else {
                res.json({
                    success: true,
                    message: `Profile ${userProfile} views`,
                    data: {
                        likes: userProfile.likes,
                        followers: userProfile.followers.length,
                        following: userProfile.following.length
                    }
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message
        });
    }
};

// See followers list
const seeFollowers = async (req, res) => {
    try{
        const userId = req.params.userId;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.followers.length === 0) {
                throw new Error(`User has no followers`);
            } else {
                res.json({
                    success: true,
                    message: `User's followers`,
                    followers: userProfile.followers
                });
            }
        }
    } catch(error){
        res.json({
            success: false, 
            message: error.message 
        });
    }
};

// See Following list
const seeFollowing = async (req, res) => {
    try {
        const { userId, requesterId } = req.params;
        const userProfile = await User.findById(userId);
        
        if (!userProfile) {
            throw Error(`User not found`);
        } else {
            if (userProfile.seeFollowing && userId !== requesterId) {
                // If followingPrivacy is enabled
                throw Error(`User's following list is private`);
            }
            
            if (userProfile.following.length === 0) {
                throw new Error(`User is not following anyone`);
            } else {
                res.json({
                    success: true,
                    message: `User's following`,
                    following: userProfile.following
                });
            }
        }
    } catch(error) {
        res.json({
            success: false, 
            message: error.message 
        });
    }
};


// Share Profile
const shareProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found`);
        }
        // Construct the shareable link
        const shareableLink = `${req.protocol}://${req.get(`host`)}/api/v1/user/get_profile/${userId}`;
        // Send the shareable link in the response
        res.json({
            success: true,
            message: `Profile Shared`,
            link: shareableLink
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
};


// Block a user
const blockUser = async (req, res) => {
    const { userId, blockedUserId } = req.params;

    try {
        // Check if the user to be blocked exists
        const userToBlock = await User.findById(blockedUserId);
        if (!userToBlock) {
            throw new Error(`User to be blocked not found`);
        }

        // Check if the blocking user exists
        const blockingUser = await User.findById(userId);
        if (!blockingUser) {
            throw new Error(`Blocking user not found`);
        }

         // Remove the blocked user from the followers & following list of the blocking user
         blockingUser.followers.pull(blockedUserId);
         blockingUser.following.pull(blockedUserId);

        // Update the blocking user`s blockedUsers array to include blockedUserId
        await blockingUser.blockedUsers.push(blockedUserId);
        await blockingUser.save();

        res.json({
            success: true,
            message: `User blocked successfully`
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Add friends
const addFriends = async (req, res) => {
    const { userId, friendId } = req.params;
    const userProfile = await User.findById(userId);
    const friendProfile = await User.findById(friendId);
    try {
        if (!userProfile) {
            throw Error('User`s Profile not found');
        }

        if (!friendProfile) {
            throw Error('Friend`s Profile not found');
        }

        await userProfile.friends.push(friendId);
        await friendProfile.friends.push(userId);
        await userProfile.save();
        await friendProfile.save();

        res.json({
            success: true, 
            message: `Friend added successfully` 
        });

    } catch (error) {
        res.json({
            success: false, 
            message: error.message 
        });
    }
};



module.exports = {
    getProfile, 
    getAllUsers, 
    searchUsers,
    updateBio, 
    updateUserName,
    updateProfilePicture,
    changeEmail,
    verifyEmailChange,
    getProfilePicture,
    uploadedReels, 
    privatePosts, 
    savedPosts, 
    repostedReels, 
    seeFollowers,
    seeFollowing,
    shareProfile, 
    blockUser, 
    addFriends, 
    profileViews,
    likedPosts
};