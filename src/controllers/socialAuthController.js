const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google access token is required',
      });
    }

    // Verify Google access token and get user info
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    const { id, email, name, picture } = googleResponse.data;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get email from Google',
      });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email },
        { googleId: id }
      ]
    });

    if (user) {
      // Update Google ID if not present
      if (!user.googleId) {
        user.googleId = id;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId: id,
        isProfileComplete: false, // User needs to complete profile
        password: '', // No password for social auth users
      });
    }

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// @desc    Link social account to existing user
// @route   POST /api/auth/link-social
// @access  Private
exports.linkSocialAccount = async (req, res) => {
  try {
    const { provider, accessToken } = req.body;

    if (!provider || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Provider and access token are required',
      });
    }

    let userInfo;
    let socialIdField;

    if (provider === 'google') {
      const googleResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      userInfo = googleResponse.data;
      socialIdField = 'googleId';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Supported: google',
      });
    }

    // Check if another user already has this social ID
    const existingUser = await User.findOne({ [socialIdField]: userInfo.id });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `${provider} account is already linked to another user`,
      });
    }

    // Update current user with social ID
    const updateData = { [socialIdField]: userInfo.id };
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error('Link Social Account Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to link social account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
