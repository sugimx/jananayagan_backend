// Vercel serverless function entry point
// This file is called by Vercel when requests come in

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../src/config/database');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Connect to Database
connectDB();

// Handle preflight requests for all routes
app.options('*', cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Giveway Backend API' });
});

// Import routes
const userRoutes = require('../src/routes/userRoutes');
const profileRoutes = require('../src/routes/profileRoutes');
const addressRoutes = require('../src/routes/addressRoutes');
const orderRoutes = require('../src/routes/orderRoutes');
const socialAuthRoutes = require('../src/routes/socialAuthRoutes');
const profilePictureRoutes = require('../src/routes/profilePictureRoutes');

app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', socialAuthRoutes);
app.use('/api/profile-pictures', profilePictureRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!!',
    error: process.env.NODE_ENV === 'PRODUCTION' ? err.message : {}
  });
});

// Export for Vercel serverless handler
module.exports = app;
