const User = require('../../user/models/User');

const updateSeeFollowing = async (req, res) => {
  const { userId } = req.params;
  const { seeFollowing } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw Error('User not found');
    }

    user.seeFollowing = seeFollowing !== undefined ? seeFollowing : user.seeFollowing;
    await user.save();

    res.json({
        success: true,
        message: "See following settings changed successfully",
      });
  } catch (error) {
    res.json({
        success: false,
        message: error.message,
    });
  }
};

const updateSeeLiked = async (req, res) => {
    const { userId } = req.params;
    const { seeLiked } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw Error('User not found');
      }
  
      user.seeLiked = seeLiked !== undefined ? seeLiked : user.seeLiked;
      await user.save();
  
      res.json({
        success: true,
        message: "See liked settings changed successfully",
      });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
  };

  const updateCommentPrivacy = async (req, res) => {
    const { userId } = req.params;
    const { commentPrivacy } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw Error('User not found');
      }
  
      user.commentPrivacy = commentPrivacy || user.commentPrivacy;
      await user.save();
  
      res.json({
        success: true,
        message: "Comment privacy settings changed successfully",
      })
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
  };

  const updateMentionPrivacy = async (req, res) => {
    const { userId } = req.params;
    const { mentionPrivacy } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw Error('User not found');
      }
  
      user.mentionPrivacy = mentionPrivacy || user.mentionPrivacy;
      await user.save();
  
      res.json({
        success: true,
        message: "Mention privacy settings changed successfully",
      })
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
  };

  const updateTagPrivacy = async (req, res) => {
    const { userId } = req.params;
    const { tagPrivacy } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw Error('User not found');
      }
  
      user.tagPrivacy = tagPrivacy || user.tagPrivacy;
      await user.save();
  
      res.json({
        success: true,
        message: "Tag privacy settings changed successfully",
      })
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
  };

module.exports = {  
    updateSeeFollowing, 
    updateSeeLiked, 
    updateCommentPrivacy, 
    updateMentionPrivacy, 
    updateTagPrivacy 
};
