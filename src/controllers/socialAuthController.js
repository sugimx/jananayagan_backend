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
        profilePicture: picture || null,
      });

      // Create default buyer profile automatically for new users only
      try {
        const profileData = {
          user: user._id,
          profileType: 'user',
          status: 'active',
          dateOfBirth: null,
          profileImage: picture || null,
        };

        // Only set these fields if they have values
        if (name) profileData.name = name;
        if (email) profileData.gmail = email;

        await Profile.create(profileData);
        console.log('Buyer profile created successfully for Google user:', user._id);

        // Update user's profile completion status
        user.isProfileComplete = true;
        await user.save();
      } catch (profileError) {
        console.error('Error creating buyer profile for Google user:', profileError);
        console.error('Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          keyPattern: profileError.keyPattern,
          keyValue: profileError.keyValue
        });
        
        // Delete the user if profile creation fails
        await User.findByIdAndDelete(user._id);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create buyer profile. Please try again.',
          error: profileError.message
        });
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
      error: process.env.NODE_ENV === 'PRODUCTION' ? error.message : undefined,
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
      error: process.env.NODE_ENV === 'PRODUCTION' ? error.message : undefined,
    });
  }
};
