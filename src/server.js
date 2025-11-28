require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
// CORS configuration to allow all origins and ports
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false, // Set to false when using origin: '*'
  optionsSuccessStatus: 200
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));

// Connect to Database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Giveway Backend API' });
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const socialAuthRoutes = require('./routes/socialAuthRoutes');
const profilePictureRoutes = require('./routes/profilePictureRoutes');

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
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'PRODUCTION' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

