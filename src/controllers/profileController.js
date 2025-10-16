const Profile = require('../models/Profile');
const User = require('../models/User');

// ==================== USER PROFILE ENDPOINTS ====================

// @desc    Get user profile (main profile only)
// @route   GET /api/profiles/user
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ 
      user: req.user._id, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } // Legacy profiles
      ]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
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
// @route   PUT /api/profiles/user
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, profileImage, phone, gmail, status, dist, state } = req.body;

    const profile = await Profile.findOne({ 
      user: req.user._id, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } // Legacy profiles
      ]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Update profile fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (phone) updateData.phone = phone;
    if (gmail) updateData.gmail = gmail;
    if (status) updateData.status = status;
    if (dist) updateData.dist = dist;
    if (state) updateData.state = state;
    
    // Ensure profileType is set to 'user' (for legacy profiles)
    updateData.profileType = 'user';
    
    const updatedProfile = await Profile.findByIdAndUpdate(
      profile._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== BUYER PROFILE ENDPOINTS ====================

// @desc    Create buyer profile
// @route   POST /api/profiles/buyer
// @access  Private
exports.createBuyerProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, profileImage, phone, gmail, status, dist, state } = req.body;

    // Create buyer profile
    const buyerProfile = await Profile.create({
      user: req.user._id,
      profileType: 'buyer',
      name: name || '',
      dateOfBirth: dateOfBirth || null,
      profileImage: profileImage || null,
      phone: phone || '',
      gmail: gmail || '',
      status: status || 'active',
      dist: dist || '',
      state: state || ''
    });

    res.status(201).json({
      success: true,
      message: 'Buyer profile created successfully',
      data: buyerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all buyer profiles
// @route   GET /api/profiles/buyer
// @access  Private
exports.getBuyerProfiles = async (req, res) => {
  try {
    const buyerProfiles = await Profile.find({ 
      user: req.user._id, 
      profileType: 'buyer' 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: buyerProfiles.length,
      data: buyerProfiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update buyer profile
// @route   PUT /api/profiles/buyer/:id
// @access  Private
exports.updateBuyerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dateOfBirth, profileImage, phone, gmail, status, dist, state } = req.body;

    // Check if buyer profile exists and belongs to user
    const buyerProfile = await Profile.findOne({ 
      _id: id, 
      user: req.user._id, 
      profileType: 'buyer' 
    });

    if (!buyerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    // Update profile fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (phone) updateData.phone = phone;
    if (gmail) updateData.gmail = gmail;
    if (status) updateData.status = status;
    if (dist) updateData.dist = dist;
    if (state) updateData.state = state;
    
    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Buyer profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete buyer profile
// @route   DELETE /api/profiles/buyer/:id
// @access  Private
exports.deleteBuyerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const buyerProfile = await Profile.findOneAndDelete({ 
      _id: id, 
      user: req.user._id, 
      profileType: 'buyer' 
    });

    if (!buyerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    res.json({
      success: true,
      message: 'Buyer profile deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== GET ALL PROFILES ====================

// @desc    Get all profiles (user profile + all buyer profiles)
// @route   GET /api/profiles/all
// @access  Private
exports.getAllProfiles = async (req, res) => {
  try {
    // Get user profile (including legacy profiles without profileType)
    const userProfile = await Profile.findOne({ 
      user: req.user._id, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } // Legacy profiles
      ]
    });

    // Get all buyer profiles
    const buyerProfiles = await Profile.find({ 
      user: req.user._id, 
      profileType: 'buyer' 
    }).sort({ createdAt: -1 });

    // Combine user profile and buyer profiles into a single array
    const allProfiles = userProfile ? [userProfile, ...buyerProfiles] : buyerProfiles;

    res.json({
      buyerProfiles: allProfiles,
      totalBuyerProfiles: allProfiles.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== LEGACY ENDPOINTS (Keep for backward compatibility) ====================

// @desc    Get user profile (legacy - returns user profile only)
// @route   GET /api/profiles
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ 
      user: req.user._id, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } // Legacy profiles
      ]
    });

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

// @desc    Update user profile (legacy)
// @route   PUT /api/profiles
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, profileImage, phone, gmail, status, dist, state } = req.body;

    const profile = await Profile.findOne({ 
      user: req.user._id, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } // Legacy profiles
      ]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Update profile fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (phone) updateData.phone = phone;
    if (gmail) updateData.gmail = gmail;
    if (status) updateData.status = status;
    if (dist) updateData.dist = dist;
    if (state) updateData.state = state;
    
    // Ensure profileType is set to 'user' (for legacy profiles)
    updateData.profileType = 'user';
    
    const updatedProfile = await Profile.findByIdAndUpdate(
      profile._id,
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

// @desc    Delete user profile (legacy - not recommended)
// @route   DELETE /api/profiles
// @access  Private
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ 
      user: req.user._id, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } // Legacy profiles
      ]
    });

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
