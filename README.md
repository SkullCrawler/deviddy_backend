# Deviddy Node Server

Welcome to the Deviddy Node Server repository! This server powers api.deviddy.com, providing a range of APIs for various functionalities.

## List of APIs

### API V1

1. **Auth APIs**
   - `/auth`
     - register
     - login (only when user is verified after verify_otp)
     - verify_otp (after registering user)
     - resend_otp (in case OTP times out)
     - forgot_password
     - reset_password (after verifying OTP from forgot password)
     - change_password
     - start_email verification
     - verify_email (after verifying OTP from start_email verification)
     - check_username_availability and regex (Username must be at least 3 characters long and can only contain letters(Aa), numbers, underscore (_) or period (.))
     - check_email_availability and regex
     - check_password regex

2. **Reel APIs**
   - `/reel`
     - upload
     - download
     - delete
     - share
     - like
     - save
     - update
     - get
     - repost
     - get_comments

   **2.1 Comment APIs**
   - `/reel/comment`
     - comment
     - reply
     - like (comment or reply)
     - delete (both comment and or reply)

3. **User APIs**
   - `/user`
     - get_profile
     - update_bio
     - share
     - profile_views
     - uploaded (reels)
     - saved (reels)
     - private (reels)
     - liked (reels)
     - block_user
     - reposted (reels)
     - see_following
     - see_followers
     - update_username
     - change_email (uses OTP verification)
     - verify_email_change (after verifying OTP from change_email)
     - get_all (get all users)
     - search_by_username (with partial match)
     - update_profile_picture

   **3.1 Follow APIs**
   - `/user/follow`
     - follow_request (accept if user is public and move on to respond if private)
     - respond_to_request (from follow_request)
     - unfollow_request

   **3.2 Privacy APIs**
   - `/user/privacy`
     - see_following (change to everyone or only you)
     - see_liked (change to everyone or only you)
     - comments (everyone, noOne, followersThatFollow)
     - mention (everyone, noOne, following, followersThatFollow)
     - tagging (everyone, noOne, following, followersThatFollow)

## Usage


### User Routes:

| Route                                      | Method | Description                                               | Parameters                                                | Body                                                            | Response                                                      |
|--------------------------------------------|--------|-----------------------------------------------------------|-----------------------------------------------------------|-----------------------------------------------------------------|---------------------------------------------------------------|
| `/api/v1/user/get_profile/:userId`         | GET    | Fetches user profile data                                | `userId` (User ID)                                       | None                                                            | Success: User profile data<br>Error: Error message            |
| `/api/v1/user/get_all`                     | GET    | Retrieves profiles of all users                          | None                                                      | None                                                            | Success: Array of user profiles<br>Error: Error message      |
| `/api/v1/user/search/:username`            | GET    | Searches for users by username                           | `username` (Username to search for)                      | None                                                            | Success: Array of matching user profiles<br>Error: Error message |
| `/api/v1/user/update_bio/:userId`          | POST   | Updates user bio                                         | `userId` (User ID)                                       | `{ "bio": "New bio text" }`                                     | Success: Updated bio<br>Error: Error message                 |
| `/api/v1/user/update_username/:userId`     | POST   | Updates user username                                    | `userId` (User ID)                                       | `{ "username": "New username" }`                                | Success: Updated username<br>Error: Error message            |
| `/api/v1/user/update_profile_pic/:userId`  | POST   | Updates user profile picture                             | `userId` (User ID)<br>Form data: `file` (Image file)    | None                                                            | Success: Updated profile picture URL<br>Error: Error message |
| `/api/v1/user/change_email`                | POST   | Changes user email                                       | None                                                      | `{ "currentEmail": "user@example.com", "newEmail": "newuser@example.com", "emailSubject": "Email Change Verification" }` | Success: Email change details<br>Error: Error message       |
| `/api/v1/user/verifyEmailChange`           | POST   | Verifies email change request                            | None                                                      | `{ "currentEmail": "current@example.com", "newEmail": "new@example.com" }` | Success: Email change confirmed<br>Error: Error message    |
| `/api/v1/user/get_profile_picture/:userId` | GET    | Retrieves user profile picture                           | `userId` (User ID)                                       | None                                                            | Success: Profile picture URL<br>Error: Error message        |
| `/api/v1/user/uploaded/:userId`            | GET    | Retrieves reels uploaded by a user                      | `userId` (User ID)                                       | None                                                            | Success: Array of uploaded reels<br>Error: Error message    |
| `/api/v1/user/privatePosts/:userId`        | GET    | Retrieves private posts of a user                       | `userId` (User ID)                                       | None                                                            | Success: Array of private posts<br>Error: Error message     |
| `/api/v1/user/savedPosts/:userId`          | GET    | Retrieves saved posts of a user                         | `userId` (User ID)                                       | None                                                            | Success: Array of saved posts<br>Error: Error message       |
| `/api/v1/user/likedPosts/:userId`          | GET    | Retrieves liked posts of a user                         | `userId` (User ID)<br>`requesterId` (Requester ID)      | None                                                            | Success: Array of liked posts<br>Error: Error message       |
| `/api/v1/user/repostedReels/:userId`       | GET    | Retrieves reposted reels of a user                      | `userId` (User ID)                                       | None                                                            | Success: Array of reposted reels<br>Error: Error message    |
| `/api/v1/user/profileViews/:userId`        | GET    | Retrieves profile views of a user                       | `userId` (User ID)                                       | None                                                            | Success: Profile views data<br>Error: Error message          |
| `/api/v1/user/seeFollowers/:userId`        | GET    | Retrieves followers of a user                           | `userId` (User ID)                                       | None                                                            | Success: Array of followers<br>Error: Error message          |
| `/api/v1/user/seeFollowing/:userId`        | GET    | Retrieves users followed by a user                      | `userId` (User ID)<br>`requesterId` (Requester ID)      | None                                                            | Success: Array of following users<br>Error: Error message   |
| `/api/v1/user/shareProfile/:userId`        | GET    | Generates shareable link for user profile                | `userId` (User ID)                                       | None                                                            | Success: Shareable link URL<br>Error: Error message         |
| `/api/v1/user/blockUser/:userId`           | POST   | Blocks a user                                            | `userId` (User ID)<br>`blockedUserId` (User ID)         | None                                                            | Success: User blocked<br>Error: Error message               |
| `/api/v1/user/addFriends/:userId`          | POST   | Adds a friend for the user                               | `userId` (User ID)<br>`friendId` (Friend ID)             | None                                                            | Success: Friend added<br>Error: Error message               |

## Reel Routes

| Endpoint                  | Method | Headers                  | Params/Body                                                                                    | Success Response                                            | Failure Response                                            |
|---------------------------|--------|--------------------------|------------------------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------------------------------------|
| `/upload`                 | POST   | Authorization: Bearer \<token> | FormData: `file`, `userId`, `caption`, `taggedUsers`, `mentionedUsers`, `isPrivate`, `tags` | ```json {"success": true, "message": "Reel uploaded successfully"} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/get/:userId`            | GET    | Authorization: Bearer \<token> | Params: `userId`                                                                              | ```json {"success": true, "message": "Reels gotten successfully.", "reels": [...]} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/get_comments/:reelId`   | GET    | Authorization: Bearer \<token> | Params: `reelId`                                                                              | ```json {"success": true, "message": "Comments retrieved successfully", "comments": [...]} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/update/:reelId/:userId` | POST   | Authorization: Bearer \<token> | Params: `reelId`, `userId`                                                                    | ```json {"success": true, "message": "Reel updated successfully", "data": {"caption": "<updated_caption>", "isPrivate": "<updated_privacy_status>"}} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/delete/:reelId/:userId` | DELETE | Authorization: Bearer \<token> | Params: `reelId`, `userId`                                                                    | ```json {"success": true, "message": "Reel and associated video file deleted successfully"} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/like/:reelId/:userId`   | POST   | Authorization: Bearer \<token> | Params: `reelId`, `userId`                                                                    | ```json {"success": true, "message": "Reel liked/unliked successfully", "data": {"reelId": "<reel_id>", "likes": "<updated_likes_count>"}} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/save/:reelId/:userId`   | POST   | Authorization: Bearer \<token> | Params: `reelId`, `userId`                                                                    | ```json {"success": true, "message": "Reel saved/unsaved successfully", "data": {"reelId": "<reel_id>", "saves": "<updated_saves_count>"}} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/share/:reelId/:userId`  | GET    | Authorization: Bearer \<token> | Params: `reelId`, `userId`                                                                    | ```json {"success": true, "message": "Reel Shared successfully", "data": {"videoLink": "<reel_video_url>", "reelMetaData": {"username": "<uploader_username>", "caption": "<reel_caption>", "tags": [...], "likes": "<reel_likes_count>", "shares": "<updated_shares_count>", "comments": "<reel_comments_count>", "song": "<reel_song_info>"},"shares": "<updated_shares_count>"}} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/repost/:reelId/:userId` | GET    | Authorization: Bearer \<token> | Params: `reelId`, `userId`                                                                    | ```json {"success": true, "message": "Reel reposted/unreposted successfully", "data": {"reelId": "<reel_id>", "reposts": "<updated_reposts_count>"}} ``` | ```json {"success": false, "message": "<error_message>"} ``` |
| `/download/:reelId`       | GET    | Authorization: Bearer \<token> | Params: `reelId`                                                                              | File download                                                | ```json {"success": false, "message": "<error_message>"} ``` |

### Comment Routes:

| Route                                            | Method | Description                                 | Parameters                                           | Body                                                  | Response                                            |
|--------------------------------------------------|--------|---------------------------------------------|------------------------------------------------------|-------------------------------------------------------|------------------------------------------------------|
| `/addComment/:reelId`                            | POST   | Adds a comment to a reel                   | `reelId` (Reel ID)                                   | `{ "userId": "user123", "text": "Nice reel!" }`       | Success: Comment added<br>Error: Error message      |
| `/getComments/:reelId`                           | GET    | Retrieves comments of a reel               | `reelId` (Reel ID)                                   | None                                                  | Success: Array of comments<br>Error: Error message  |
| `/updateComment/:commentId`                      | POST   | Updates a comment                          | `commentId` (Comment ID)                             | `{ "text": "Updated comment" }`                      | Success: Comment updated<br>Error: Error message    |
| `/deleteComment/:commentId`                      | DELETE | Deletes a comment                          | `commentId` (Comment ID)                             | None                                                  | Success: Comment deleted<br>Error: Error message    |
| `/likeComment/:commentId`                        | POST   | Likes a comment                            | `commentId` (Comment ID)                             | None                                                  | Success: Comment liked<br>Error: Error message      |
| `/unlikeComment/:commentId`                      | POST   | Unlikes a comment                          | `commentId` (Comment ID)                             | None                                                  | Success: Comment unliked<br>Error: Error message    |
| `/reportComment/:commentId`                      | POST   | Reports a comment                          | `commentId` (Comment ID)                             | None                                                  | Success: Comment reported<br>Error: Error message   |

### Follow Routes:

| Route                                             | Method | Description                                     | Parameters                                           | Body                                               | Response                                          |
|---------------------------------------------------|--------|-------------------------------------------------|------------------------------------------------------|----------------------------------------------------|---------------------------------------------------|
| `/follow/:userId`                                 | POST   | Follows a user                                  | `userId` (User ID)                                   | None                                               | Success: User followed<br>Error: Error message  |
| `/unfollow/:userId`                               | POST   | Unfollows a user                                | `userId` (User ID)                                   | None                                               | Success: User unfollowed<br>Error: Error message |
| `/isFollowing/:followerId/:followingId`           | GET    | Checks if a user is following another user       | `followerId` (Follower ID)<br>`followingId` (Following ID) | None                                               | Success: Following status<br>Error: Error message |

### Privacy Routes:

| Route                                           | Method | Description                                | Parameters                                      | Body                                                   | Response                                             |
|-------------------------------------------------|--------|--------------------------------------------|-------------------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| `/setPrivacy`                                   | POST   | Sets privacy settings for a user           | Authorization: Bearer \<token><br>`userId` (User ID) `privacySettings` (Privacy settings object) | `{ "isPrivateAccount": true, "allowMessages": false }` | Success: Privacy settings updated<br>Error: Error message |
| `/getPrivacy/:userId`                           | GET    | Retrieves privacy settings of a user       | `userId` (User ID)                              | None                                                   | Success: Privacy settings<br>Error: Error message      |

### Auth Routes:

| Route                           | Method | Description                       | Parameters                                       | Body                                       | Response                                  |
|---------------------------------|--------|-----------------------------------|--------------------------------------------------|--------------------------------------------|--------------------------------------------|
| `/register`                     | POST   | Registers a new user             | None                                             | `{ "username": "user123", "email": "user@example.com", "password": "password123" }` | Success: User registered<br>Error: Error message |
| `/login`                        | POST   | Logs in a user                   | None                                             | `{ "email": "user@example.com", "password": "password123" }`                             | Success: User logged in<br>Error: Error message    |
| `/forgotPassword`               | POST   | Initiates password reset process | None                                             | `{ "email": "user@example.com" }`          | Success: Password reset initiated<br>Error: Error message |
| `/resetPassword/:resetToken`    | POST   | Resets user password             | `resetToken` (Reset token)                       | `{ "password": "newpassword123" }`        | Success: Password reset<br>Error: Error message      |
| `/logout`                       | GET    | Logs out a user                  | None                                             | None                                       | Success: User logged out<br>Error: Error message    |

These tables outline the routes, methods, descriptions, parameters, request bodies (where applicable), and responses for each API endpoint in your social media platform. Let me know if you need further details or if there's anything else I can assist you with!

## Contributors

- [Rayyan Waseem](https://github.com/skullcrawler)
