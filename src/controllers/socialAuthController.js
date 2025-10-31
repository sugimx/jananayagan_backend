const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, 'e4b2f472aa63e6df8b4c9a7e8c9c44f5a6d2b8cd3a83f1e9f03df7e57a41b8f7', {
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
        isProfileComplete: false,
        password: '',
        profilePicture: picture || null,
      });

      // Ensure a single 'user' profile exists (do not auto-create buyer profile)
      try {
        const profileDefaults = {
          user: user._id,
          profileType: 'user',
          status: 'active',
          dateOfBirth: null,
          profileImage: picture || null,
        };

        if (name) profileDefaults.name = name;
        if (email) profileDefaults.gmail = email;

        await Profile.findOneAndUpdate(
          { user: user._id, profileType: 'user' },
          { $setOnInsert: profileDefaults },
          { upsert: true, new: true }
        );
        console.log('User profile ensured for Google user:', user._id);
      } catch (profileError) {
        console.error('Error ensuring user profile for Google user:', profileError);
        // Do not block login; user can complete profile later
      }
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
