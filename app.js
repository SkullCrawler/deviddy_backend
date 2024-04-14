const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/api/v1/auth/routes/authRoutes');
const reelRoutes = require('./src/api/v1/reel/routes/reelRoutes');
const userRoutes = require('./src/api/v1/user/routes/userRoutes');
const followRoutes = require('./src/api/v1/user/follow/routes/followRoutes');
const commentRoutes = require('./src/api/v1/reel/comment/routes/commentRoutes');
const privacyRoutes = require('./src/api/v1/user/privacy/privacyRoutes');

const app = express();
dotenv.config();

const corsOptions = {
    origin: "",
}

// app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Define a route handler for the root endpoint
app.get('/', (req, res) => {
    res.send('Server Is Live');
});

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Cross-orign resource sharing
app.use(cors(corsOptions));

// API Version 1

// Auth Routes
app.use('/api/v1/auth', authRoutes);

// Reel/Video Routes
app.use('/api/v1/reel', reelRoutes);

// User Routes
app.use('/api/v1/user', userRoutes);

// Privacy Routes
app.use('/api/v1/user/privacy', privacyRoutes);

// User Routes
app.use('/api/v1/user/follow', followRoutes);

// Comment Routes
app.use('/api/v1/reel/comment', commentRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
