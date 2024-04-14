const User = require(`../../models/User`);
const FollowRequest = require(`../models/followRequestModel`);

// Route to send a follow request
const followUser = async (req, res) => {
    try {
        const recipientId = req.body.recipientId;
        const requesterId = req.body.requesterId;

        // Check if the requester is already following the user
        const existingFollower = await User.findOne({ followers: requesterId, _id: recipientId });
        if (existingFollower) {
            throw Error(`You are already following this user.`);
        }

        // Check if the requester is blocked by the recipient
        const recipientUser = await User.findById(recipientId);
        if (recipientUser.blockedUsers.includes(requesterId)) {
            throw Error(`You are blocked by this user. Follow request cannot be sent.`);
        }

        // Check if there is a pending follow request
        const pendingRequest = await FollowRequest.findOne({ requesterId: requesterId, recipientId: recipientId, status: `pending` });
        if (pendingRequest) {
            throw Error(`A follow request is already pending for this user.`);
        }

        const requestUser = await User.findById(requesterId);

        // Create a new follow request for a private user
        if (recipientUser.isPrivate) {
            const followRequest = await FollowRequest.create({
                requesterId: requesterId,
                recipientId: recipientId,
                status: `pending`
            });
            await followRequest.save();
            res.json({
                success: true,
                message: `Follow request sent successfully.`,
                requestId: followRequest._id
            });
        } else {
            await recipientUser.followers.push(requesterId);
            await requestUser.following.push(recipientId);
            await recipientUser.save();
            await requestUser.save();
            res.json({
                success: true,
                message: `User followed successfully.`,
            });
        }
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

  
// Route to accept/reject a follow request
const respondToRequest = async (req, res) => {
try {
    const followRequestId = req.body.requestId;
    const recipientId = req.body.recipient;
    const status = req.body.status;

    const followRequest = await FollowRequest.findById(followRequestId);
    if (!followRequest || followRequest.recipientId.toString() !== recipientId) {
        throw Error(`Follow request not found.`);
    }

    // Update the status of the follow request
    followRequest.status = status;
    await followRequest.save();

    // Update the user`s followers and pendingFollowRequests arrays
    const requesterId = followRequest.requesterId;
    const recipientUser = await User.findById(recipientId);
    const requestUser = await User.findById(requesterId);

    if (status === `accepted`) {
        recipientUser.followers.push(requesterId);
        requestUser.following.push(recipientId);
        await FollowRequest.findByIdAndDelete(followRequestId);
    } else if (status === `rejected`) {
        requestUser.pendingFollowRequests.pull(recipientId);
        await FollowRequest.findByIdAndDelete(followRequestId);
    }

    await recipientUser.save();
    await requestUser.save();

    res.json({
        success: true, 
        message: `Follow request ${status === `accepted` ? `accepted` : `rejected`} successfully.` ,
    });
    } catch (error) {
        res.json({
            success: false, 
            message: error.message 
        });
    }
};

// Route to unfollow a user
const unfollowUser = async (req, res) => {
try {
    const followedUser = req.body.unfollowing;
    const followingUser = req.body.follower;

    // Check if the follower is following the user
    const existingFollow = await User.findOne({ followers: followingUser, _id: followedUser });
    if (!existingFollow) {
        throw Error(`You are not following this user.`);
    }

    // Remove the user from the follower`s followers array
    const following = await User.findById(followedUser);
    const follower = await User.findById(followingUser);
    follower.following.pull(followedUser);
    following.followers.pull(followingUser);
    await follower.save();
    await following.save();

    res.json({
        success: true, 
        message: `User unfollowed successfully.` 
    });
    } catch (error) {
        console.error(error);
        res.json({
            success: false, 
            message: error.message 
        });
    }
}


module.exports = {
    followUser, respondToRequest, unfollowUser
};