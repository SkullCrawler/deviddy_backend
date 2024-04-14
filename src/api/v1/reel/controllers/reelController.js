const User = require(`../../user/models/User`);
const Reel = require(`../models/reelModel`);
const Comment = require(`../comment/models/commentModel`);
const fs = require("fs");
const path = require('path');


// Function to check privacy settings for tagging and mentioning
const checkPrivacy = async (userIds) => {
  const usersWithPrivacy = await User.find({
    _id: { $in: userIds }
  });

  const canTagUsers = usersWithPrivacy.every(user => {
    switch (user.tagPrivacy) {
      case 'everyone':
        return true;
      case 'following':
        return userIds.every(id => id !== user._id.toString() || user.followers.includes(id));
      case 'followersThatFollow':
        const followers = user.followers;
        const following = user.following;
        return userIds.every(id => followers.includes(id) && following.includes(id));
      case 'noOne':
        return false;
      default:
        return false;
    }
  });

  const canMentionUsers = usersWithPrivacy.every(user => {
    switch (user.mentionPriavcy) {
      case 'everyone':
        return true;
      case 'following':
        return userIds.every(id => id !== user._id.toString() || user.followers.includes(id));
      case 'followersThatFollow':
        const followers = user.followers;
        const following = user.following;
        return userIds.every(id => followers.includes(id) && following.includes(id));
      case 'noOne':
        return false;
      default:
        return false;
    }
  });

  return { canTagUsers, canMentionUsers };
};

// Function to upload a reel
const uploadReel = async (req, res) => {
  try {
    const { userId, caption, taggedUsers, mentionedUsers, isPrivate, tags } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(`User not found`);
    }

    // // Convert usernames to array of user objects
    // const taggedUserObjects = await User.find({ username: { $in: taggedUsers } });
    // const mentionedUserObjects = await User.find({ username: { $in: mentionedUsers } });

    // // Extract userIds from the user objects
    // const taggedUserIds = taggedUserObjects.map(user => user._id);
    // const mentionedUserIds = mentionedUserObjects.map(user => user._id);

    // // Check mention and tag privacy settings for the tagged and mentioned users
    // const { canTagUsers, canMentionUsers } = await checkPrivacy([...taggedUsers, ...mentionedUsers]);

    // if (!canTagUsers) {
    //   throw new Error(`Unauthorized to tag users`);
    // }

    // if (!canMentionUsers) {
    //   throw new Error(`Unauthorized to mention users`);
    // }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const newReel = await Reel.create({
      userId,
      caption,
      taggedUsers,
      mentionedUsers,
      isPrivate,
      tags,
      reelFilePath: req.file.path
    });

    if (isPrivate) {
      user.privateReels.push(newReel._id);
    } else {
      user.reels.push(newReel._id);
    }
    await user.save();

    res.json({
      success: true,
      message: `Reel uploaded successfully`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};


// Function to get reelIds
const getReels = async (req, res) => {
  const requesterId = req.params.userId;
  try {
      // Fetch all reels
      const reels = await Reel.find();

      // Filter reels based on privacy settings and ownership
      const filteredReels = await Promise.all(reels.map(async reel => {
          if (reel.isPrivate && reel.userId.toString() !== requesterId) {
              const uploader = await User.findById(reel.userId);
              if (uploader && uploader.blockedUsers.includes(requesterId)) {
                  return null; // If uploader has blocked the requester, filter out the reel
              }
          }
          return reel;
      }));

      // Remove null values from the filteredReels array
      const validReels = filteredReels.filter(reel => reel !== null);

      // Prepare response with selected fields
      const response = await Promise.all(validReels.map(async reel => {
        if (!reel.userId) {
          console.log("Reel with ID:", reel._id, "has no uploader ID");
          return null;
        }
        const uploader = await User.findById(reel.userId);
        if (!uploader) {
          console.log("Uploader not found for reel with ID:", reel._id);
          return null;
        }

        // Construct the URL for reelFilePath
        const reelFilePath = reel.reelFilePath.replace(/\\/g, '/');
        const reelUrl = `${req.protocol}://${req.get('host')}/${reelFilePath}`;

        return {
            reelId: reel._id,
            username: uploader.username, // Include username here
            caption: reel.caption,
            tags: reel.tags,
            likes: reel.likes,
            shares: reel.shares,
            comments: reel.comments.length,
            song: reel.song,
            reelPath: reelUrl
        };
      }));

      // Filter out null values from the response
      const filteredResponse = response.filter(reel => reel !== null);

      // Return reels
      res.json({
          success: true,
          message: `Reels gotten successfully.`,
          reels: filteredResponse
      });
  } catch (error) {
      res.json({
          success: false,
          message: error.message
      });
  }
};

// Get comments
const getReelComments = async (req, res) => {
  try {
    const reelId = req.params.reelId;

    // Find the reel by ID
    const reel = await Reel.findById(reelId);

    if (!reel) {
      throw new Error(`Reel not found`);
    }

    // Extract comments from the reel
    const comments = reel.comments;

    if (reel.comments.length === 0) {
      res.json({
        success: true,
        message: `No comments found for reel with ID ${reelId}`,
        comments: []
      });
    } else {
      // Fetch additional information for each comment
      const populatedComments = await Promise.all(comments.map(async commentId => {
        // Find comment by commentId
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
          throw new Error(`Comment not found with ID ${commentId}`);
        }

        // Fetch user by userId
        const user = await User.findById(comment.userId);

        if (!user) {
          throw new Error(`User not found for comment with ID ${commentId}`);
        }
        const userId = user._id.toString();

        // If the profile picture is null and you want to provide a local fallback
        if (!user.profilePicture) {
          // Adjust the path based on your folder structure
          const profilePicturePath = `${req.protocol}://${req.get('host')}/public/assets/default-profile-picture.jpg`;
          return {
            commentId: comment._id,
            text: comment.text,
            userId: user._id,
            username: user.username,
            profilePicture: profilePicturePath
          };
        }else{
          const profilePicturePath = user.profilePicture.replace(/\\/g, '/');
          const picUrl = `${req.protocol}://${req.get('host')}/${profilePicturePath}`;
          return {
            commentId: comment._id,
            text: comment.text,
            userId: user._id,
            username: user.username,
            profilePicture: picUrl
          };
        }
      }));

      res.json({
        success: true,
        message: `Comments retrieved successfully for reel with ID ${reelId}`,
        comments: populatedComments
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Function to update a reel
const updateReel = async (req, res) => {
  try {
    const { reelId, userId} = req.params;
    const { caption, isPrivate, tags, taggedUsers, mentionedUsers } = req.body;
    const user = await User.findById(userId);
    const reel = await Reel.findById(reelId);

    if (!reel) {
      throw new Error(`Reel not found`);
    }

    if (!user) {
      throw new Error(`User not found`);
    }
    
    const reelUserId = reel.userId.toString();
    const requestUserId = user._id.toString();

    if(reelUserId !== requestUserId) {
      throw new Error(`Unauthorized user`);
    }

    // Convert usernames to array of user objects
    const taggedUserObjects = await User.find({ username: { $in: taggedUsers } });
    const mentionedUserObjects = await User.find({ username: { $in: mentionedUsers } });

    // Extract userIds from the user objects
    const taggedUserIds = taggedUserObjects.map(user => user._id);
    const mentionedUserIds = mentionedUserObjects.map(user => user._id);

    // Check mention and tag privacy settings for the tagged and mentioned users
    const { canTagUsers, canMentionUsers } = await checkPrivacy([...reel.taggedUsers, ...reel.mentionedUsers]);

    if (!canTagUsers) {
      throw new Error(`Unauthorized to tag users`);
    }

    if (!canMentionUsers) {
      throw new Error(`Unauthorized to mention users`);
    }

    // Check if the reel was previously private
    const wasPrivate = reel.isPrivate;

    // Update the reel
    await Reel.findByIdAndUpdate(reelId, {
      caption,
      isPrivate,
      tags,
      taggedUsers: canTagUsers ? taggedUserIds : [],
      mentionedUsers: canMentionUsers ? mentionedUserIds : [],
    });

    // Handle the cases where privacy status hasn`t changed
    if (isPrivate === wasPrivate) {
      res.json({
        success: true,
        message: `Reel update succcessfully`,
        data: {
          caption,
          isPrivate
        }
      });
      return; // Exit the function early since no further action is needed
    }

    // Handle the cases where privacy status has changed
    if (isPrivate && !wasPrivate) {
      // If the reel is now private and was previously public
      // Remove it from user.reels and add it to user.privateReels
      user.reels.pull(reelId);
      user.privateReels.push(reelId);
    } else if (!isPrivate && wasPrivate) {
      // If the reel is now public and was previously private
      // Remove it from user.privateReels and add it to user.reels
      user.privateReels.pull(reelId);
      user.reels.push(reelId);
    }

    await user.save();
    res.json({
      success: true,
      message: `Reel updated successfully`,
      data: {
        caption,
        isPrivate
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Function to delete a reel
const deleteReel = async (req, res) => {
  try {
    const { reelId, userId } = req.params;

    // Find the reel by ID
    const reel = await Reel.findById(reelId);
    const user = await User.findById(userId);

    if (!reel) {
      throw new Error(`Reel not found`);
    }

    if (!user) {
      throw new Error(`User not found`);
    }

    const reelFilePath = reel.reelFilePath;
    const reelPath = path.resolve(__dirname, '..', '..', '..', '..', '..', reelFilePath);

    // Check if the file exists
    if (!fs.existsSync(reelPath)) {
      throw new Error(`Reel File not found`);
    }

    // Delete the reel record from the user collection
    if (reel.isPrivate) {
      user.privateReels.pull(reelId);
    } else {
      user.reels.pull(reelId);
    }
    await user.save();

    // Delete the file from the file system
    fs.unlinkSync(reelPath);

    // Delete the reel record from the database
    await Reel.findByIdAndDelete(reelId);

    res.json({
      success: true,
      message: `Reel and associated video file deleted successfully`
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Function to like a reel
const likeReel = async (req, res) => {
  const { reelId, userId } = req.params;

  try {
      const reel = await Reel.findById(reelId);
      const user = await User.findById(userId);

      if (!reel) {
          throw Error(`Reel not found`);
      }

      // Check if the user is blocked by the uploader
      const uploader = await User.findById(reel.userId);
      if (uploader && uploader.blockedUsers.includes(userId)) {
          throw new Error(`You are blocked by the uploader of this reel`);
      }

      if (reel.likedBy.includes(userId)) {
        reel.likes -= 1;
        reel.likedBy.pull(userId);
        user.likes -= 1;
        user.likedReels.pull(reelId);

      }else{
        reel.likes += 1;
        reel.likedBy.push(userId);
        user.likes += 1;
        user.likedReels.push(reelId);
      }

      
      await reel.save();
      await user.save();

      res.json({
          success: true,
          message: `Reel liked/unliked successfully`,
          data:{
            reelId,
            likes: reel.likes
          }
      });
  } catch (error) {
      res.json({
          success: false,
          message: error.message
      });
  }
};

// function to save a reel
const saveReel = async (req, res) => {
  const { reelId, userId } = req.params;

  try {
      const reel = await Reel.findById(reelId);
      const user = await User.findById(userId);

      if (!reel) {
          throw Error(`Reel not found`);
      }

      // Check if the user is blocked by the uploader
      const uploader = await User.findById(reel.userId);
      if (uploader && uploader.blockedUsers.includes(userId)) {
          throw new Error(`You are blocked by the uploader of this reel`);
      }

      if (reel.savedBy.includes(userId)) {
          reel.saves -= 1;
          reel.savedBy.pull(userId);
          user.savedReels.pull(reelId);
      }else{
        reel.saves += 1;
        reel.savedBy.push(userId);
        user.savedReels.push(reelId);
      }
      await reel.save();
      await user.save();

      res.json({
          success: true,
          message: `Reel saved/unsaved successfully`,
          data: {
            reelId,
            saves: reel.saves,
          }
      });
  } catch (error) {
      res.json({
          success: false,
          message: error.message
      });
  }
};

// function to share a reel
const shareReel = async (req, res) => {
  try {
    const { userId, reelId } = req.params;

    const reel = await Reel.findById(reelId);


    if (!reel) {
      throw new Error(`Reel not found`);
    }

    // Check if the user is blocked by the uploader
    const uploader = await User.findById(reel.userId);
    if (uploader && uploader.blockedUsers.includes(userId)) {
      throw new Error(`You are blocked by the uploader of this reel`);
    }

    const username = uploader.username;

    // Construct the URL for reelFilePath
    const reelFilePath = reel.reelFilePath.replace(/\\/g, '/');
    const reelUrl = `${req.protocol}://${req.get('host')}/${reelFilePath}`;

    const metaData = {
      username: username,
      caption: reel.caption,
      tags: reel.tags,
      likes: reel.likes,
      shares: reel.shares,
      comments: reel.comments.length,
      song: reel.song,
    };

    reel.shares += 1;
    reel.sharedBy.push(userId);
    await reel.save();

    res.json({
      success: true,
      message: `Reel Shared successfully`,
      data: {
        videoLink: reelUrl,
        reelMetaData: metaData,
        shares: reel.shares,
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
};

// function to repost a reel
const repostReel = async (req, res) => {
  const { reelId, userId } = req.params;

  try {
    const reel = await Reel.findById(reelId);
    const user = await User.findById(userId);

    if (!reel) {
      throw Error(`Reel not found`);
    }

    // Check if the user is blocked by the uploader
    const uploader = await User.findById(reel.userId);
    if (uploader && uploader.blockedUsers.includes(userId)) {
      throw new Error(`You are blocked by the uploader of this reel`);
    }

    // Check if the user has already reposted the reel
    if (reel.repostedBy.includes(userId)) {
      reel.reposts -= 1;
      reel.repostedBy.pull(userId);
      user.repostedReels.pull(reelId);
    }else{
      reel.reposts += 1;
      reel.repostedBy.push(userId);
      user.repostedReels.push(reelId);
    }

    await reel.save();
    await user.save();

    res.json({
      success: true,
      message: `Reel reposted/unreposted successfully`,
      data: {
        reelId,
        reposts: reel.reposts,
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// function to download a reel
const downloadReel = async (req, res) => {
  try {
    const reelId = req.params.reelId;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      throw new Error(`Reel not found`);
    }

    const reelFilePath = reel.reelFilePath;
    const reelPath = path.resolve(__dirname, '..', '..', '..', '..', '..', reelFilePath);

    // Check if the file exists
    if (!fs.existsSync(reelPath)) {
      throw new Error(`Reel File not found`);
    }

    // Set response headers for downloading
    res.setHeader('Content-Disposition', `attachment; filename=${reelFilePath}`);
    res.setHeader('Content-Type', 'video/mp4');

    // Create a read stream for the file and pipe it to the response
    const fileStream = fs.createReadStream(reelPath);
    fileStream.pipe(res);
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  uploadReel, 
  getReels,
  getReelComments,
  deleteReel, 
  updateReel, 
  likeReel, 
  saveReel, 
  repostReel, 
  shareReel, 
  downloadReel
};