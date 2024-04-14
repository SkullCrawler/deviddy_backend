const Comment = require(`../models/commentModel`);
const Reply = require(`../models/replyModel`);
const Reel = require(`../../models/reelModel`);
const User = require(`../../../user/models/User`);

// Function to check mention privacy settings
const checkMentionPrivacy = async (userIds) => {
  const usersWithPrivacy = await User.find({
    _id: { $in: userIds }
  });

  const canMentionUsers = usersWithPrivacy.every(user => {
    switch (user.mentionPrivacy) {
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

  return canMentionUsers;
};

// Function to check comment privacy settings
const checkCommentPrivacy = async (uploaderId, userId, commentPrivacy) => {
  const uploader = await User.findById(uploaderId);
  if (!uploader) {
    throw new Error(`Uploader not found`);
  }

  switch (commentPrivacy) {
    case 'everyone':
      return true;
    case 'followersThatFollow':
      return uploader.followers.includes(userId) && uploader.following.includes(userId);
    case 'noOne':
      return false;
    default:
      return false;
  }
};

// Module to add a comment
const comment = async (req, res) => {
  const { reelId, userId } = req.params;
  const { text, mentionedUsers } = req.body;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      throw Error(`Reel not found`);
    }

    const uploaderId = reel.userId;
    const uploader = await User.findById(uploaderId);
    if (!uploader) {
      throw new Error(`Uploader not found`);
    }

    if (uploader.blockedUsers.includes(userId)) {
      throw new Error(`You are blocked by the uploader of this reel`);
    }

    // Check comment privacy settings
    const canComment = await checkCommentPrivacy(uploaderId, userId, uploader.commentPrivacy);
    if (!canComment) {
      throw new Error(`Unauthorized to comment on this reel`);
    }

    const mentionedUserObjects = await User.find({ username: { $in: mentionedUsers } });
    const mentionedUserIds = mentionedUserObjects.map(user => user._id);

    // Check mention privacy settings
    const canMentionUsers = await checkMentionPrivacy(mentionedUserIds);

    if (!canMentionUsers) {
      throw new Error(`Unauthorized to mention users`);
    }

    const newComment = await Comment.create({
      reelId: reelId,
      userId: userId,
      text: text,
      mentionedUsers: mentionedUserIds
    });

    await newComment.save();
    reel.comments.push(newComment._id);
    await reel.save();
    const username = await User.findOne({ _id: userId }, `username`);

    res.json({
      success: true,
      message: `Comment added successfully`,
      // Todo comment with username, userId, comment_text
      // data: {
      //   reelId: reelId,
      //   username: username,
      //   commentId: newComment._id,
      //   text: text,
      //   mentionedUsers: mentionedUsers
      // },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Module to add a reply to a comment
const replyToComment = async (req, res) => {
  const { commentId, userId } = req.params;
  const { text, mentionedUsers } = req.body;

  try {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw Error(`Comment not found`);
    }

    // find the uploader
    const reelId = parentComment.reelId;
    const reel = await Reel.findById(reelId);
    const uploaderId = reel.userId;
    const uploader = await User.findById(uploaderId);

    const parentCommenterId = parentComment.userId;
    const parentCommenter = await User.findById(parentCommenterId);
    if (!parentCommenter) {
      throw new Error(`Parent commenter not found`);
    }

    if (parentCommenter.blockedUsers.includes(userId)) {
      throw new Error(`You are blocked by the commenter of the parent comment`);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found`);
    }

    // Check comment privacy settings
    const canComment = await checkCommentPrivacy(uploaderId, userId, uploader.commentPrivacy);
    if (!canComment) {
      throw new Error(`Unauthorized to reply to this comment`);
    }

    const mentionedUserObjects = await User.find({ username: { $in: mentionedUsers } });
    const mentionedUserIds = mentionedUserObjects.map(user => user._id);

    // Check mention privacy settings
    const canMentionUsers = await checkMentionPrivacy(mentionedUserIds);

    if (!canMentionUsers) {
      throw new Error(`Unauthorized to mention users`);
    }

    const reply = await Reply.create({
      commentId: commentId,
      userId: userId,
      text: text,
      mentionedUsers: mentionedUserIds
    });

    await reply.save();
    parentComment.replies.push(reply._id);
    await parentComment.save();
    const username = await User.findOne({ _id: userId }, `username`);

    res.json({
      success: true,
      message: `Reply added successfully`
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

  


// Like a comment or reply
const likeCommentReply = async (req, res) => {
  const { entityId, entityType } = req.params; // entityId can be either commentId or replyId
  const { userId } = req.body;

  try {
      // Determine the entity type and find it accordingly
      let entity;
      if (entityType === `comment`) {
          entity = await Comment.findById(entityId);
      } else if (entityType === `reply`) {
          entity = await Reply.findById(entityId);
      } else {
          throw new Error(`Invalid entity type`);
      }

      if (!entity) {
          throw new Error(`Entity not found`);
      }

      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
          throw new Error(`User not found`);
      }

      // Check if the user is blocked by the commenter or replier
      const entityOwnerId = entity.userId;
      const entityOwner = await User.findById(entityOwnerId);
      if (!entityOwner) {
          throw new Error(`${entityType} owner not found`);
      }else if (entityOwner.blockedUsers.includes(userId)) {
        // User blocked
        throw new Error(`You are blocked by the ${entityType} owner`);
      }else if (entity.likedBy.includes(userId)) {
        // already liked so dislike it
        entity.likes -= 1;
        entity.likedBy.pull(userId);
      }else{
        entity.likes += 1;
        entity.likedBy.push(userId);
        
      } 
      // save the comment/replt with updated likes and user
      await entity.save();

      res.json({
          success: true,
          message: `${entityType} liked/unliked successfully`,
          data: {
              entityId: entityId,
              likes: entity.likes
          }
      });
  } catch (error) {
      console.error(error);
      res.status(400).json({
          success: false,
          message: error.message
      });
  }
};


// Delete a comment or reply
const deleteEntity = async (req, res) => {
  const { entityId, entityType } = req.params; // entityId can be either commentId or replyId
  const { userId } = req.body;

  try {
      let entity;

      // Determine the entity type and find it accordingly
      if (entityType === `comment`) {
          entity = await Comment.findById(entityId);
          // Delete all associated replies if it`s a comment
          await Reply.deleteMany({ commentId: entityId });
      } else if (entityType === `reply`) {
          entity = await Reply.findById(entityId);
          // Remove the reply from the parent comment`s replies array
          const parentComment = await Comment.findById(entity.commentId);
          if (parentComment) {
              parentComment.replies.pull(entityId);
              await parentComment.save();
          }
      } else {
          throw new Error(`Invalid entity type`);
      }

      if (!entity) {
          throw new Error(`Entity not found`);
      }

      // Check if the user making the request is the uploader of the reel or the commenter
      const uploaderOfReel = await Reel.exists({ _id: entity.reelId, userId: userId });
      const commenter = entity.userId.toString() === userId;

      if (!uploaderOfReel && !commenter) {
          throw new Error(`You are not authorized to delete this entity`);
      }

      // Delete the entity
      await entity.deleteOne();

      res.json({
          success: true,
          message: `${entityType} deleted successfully`
      });
  } catch (error) {
      console.error(error);
      res.status(400).json({
          success: false,
          message: error.message
      });
  }
};


module.exports = {
    comment, replyToComment, likeCommentReply, deleteEntity
};