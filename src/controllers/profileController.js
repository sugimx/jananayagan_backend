const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Create user profile
// @route   POST /api/profiles
// @access  Private
exports.createProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, bio } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'All fields (firstName, lastName, dateOfBirth) are required',
      });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists for this user',
      });
    }

    // Create profile
    const profile = await Profile.create({
      user: req.user._id,
      firstName,
      lastName,
      dateOfBirth,
      bio: bio || '',
    });

    // Update user's profile completion status
    await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/profiles
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profiles
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, bio, profileImage, preferences } = req.body;

    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Update profile fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (preferences) updateData.preferences = preferences;

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profiles
// @access  Private
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Update user's profile completion status
    await User.findByIdAndUpdate(req.user._id, { isProfileComplete: false });

    res.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
