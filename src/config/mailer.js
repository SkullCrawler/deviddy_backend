const postmark = require('postmark');
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../api/v1/user/models/User');
const UserOTPVerification = require('../api/v1/auth/models/UserVerfication');

// Create a Postmark client
const client = new postmark.Client(process.env.POSTMARK_SERVER_KEY);

// Function to check Postmark client connectivity
const checkPostmarkConnectivity = async () => {
    return new Promise((resolve, reject) => {
        client.getServer((error, server) => {
            if (error) {
                reject(error);
            } else {
                resolve(server);
            }
        });
    });
};

// Function to send OTP verification email
const sendOTPVerificationEmail = async ({ email, emailSubject }, res) => {
    try {
        // Check Postmark connectivity
        await checkPostmarkConnectivity();

        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        // Mail options
        const mailOptions = {
            From: process.env.MAIL_USERNAME,
            To: email,
            Subject: emailSubject,
            TextBody: `Enter ${otp} in the app to verify your email address. This code expires in 1 hour.`
        };

        // Find user
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User not found');
        }

        const userId = user._id.toString();

        // Hash OTP
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save OTP verification details
        const newOTPVerification = await new UserOTPVerification({
            userId: userId,
            otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 // 1 Hour expiry time
        }).save();

        // Send email using Postmark
        client.sendEmail(mailOptions, function (error, result) {
            if (error) {
                console.error('Unable to send via postmark: ' + error.message);
            }
            console.info('Sent to postmark for delivery');
        });

        res.json({
            success: true,
            message: 'Email sent successfully',
            data: {
                email: email,
                otp,
                verified: user.verified
            }
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

module.exports = sendOTPVerificationEmail;
