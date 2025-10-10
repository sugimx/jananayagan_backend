const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Middleware for single file upload
const uploadSingle = upload.single('profilePicture');

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname);
  const name = crypto.randomBytes(16).toString('hex');
  return `${name}${ext}`;
};

// Generate image hash for duplicate detection
const generateImageHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// @desc    Upload user profile picture
// @route   POST /api/profile-pictures/user
// @access  Private
exports.uploadUserProfilePicture = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Profile picture is required',
        });
      }

      // Generate unique filename
      const filename = generateUniqueFilename(req.file.originalname);
      const filepath = path.join('uploads', 'profile-pictures', 'user', filename);

      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Process and save image
      await sharp(req.file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(filepath);

      // Generate image hash for duplicate detection
      const imageHash = generateImageHash(req.file.buffer);

      // Check for duplicate profile pictures
      const existingProfile = await Profile.findOne({
        profileImageHash: imageHash,
        user: { $ne: req.user._id }
      });

      if (existingProfile) {
        // Delete the uploaded file if duplicate found
        fs.unlinkSync(filepath);
        return res.status(400).json({
          success: false,
          message: 'Duplicate profile picture detected. Please use a different image.',
        });
      }

      // Delete old profile picture if exists
      const user = await User.findById(req.user._id);
      if (user.profilePicture) {
        const oldFilePath = path.join('uploads', 'profile-pictures', 'user', path.basename(user.profilePicture));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update user profile picture
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePicture: `/uploads/profile-pictures/user/${filename}` },
        { new: true }
      );

      res.json({
        success: true,
        message: 'User profile picture uploaded successfully',
        data: {
          profilePicture: updatedUser.profilePicture,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload buyer profile picture
// @route   POST /api/profile-pictures/buyer
// @access  Private
exports.uploadBuyerProfilePicture = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Profile picture is required',
        });
      }

      // Generate unique filename
      const filename = generateUniqueFilename(req.file.originalname);
      const filepath = path.join('uploads', 'profile-pictures', 'buyer', filename);

      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Process and save image
      await sharp(req.file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(filepath);

      // Get or create user profile
      let profile = await Profile.findOne({ user: req.user._id });
      
      if (!profile) {
        profile = await Profile.create({
          user: req.user._id,
          firstName: req.user.name.split(' ')[0] || 'User',
          lastName: req.user.name.split(' ').slice(1).join(' ') || '',
          dateOfBirth: new Date(),
        });
      }

      // Delete old buyer profile picture if exists
      if (profile.buyerProfileImage) {
        const oldFilePath = path.join('uploads', 'profile-pictures', 'buyer', path.basename(profile.buyerProfileImage));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update buyer profile picture (allows duplicates)
      const updatedProfile = await Profile.findByIdAndUpdate(
        profile._id,
        { buyerProfileImage: `/uploads/profile-pictures/buyer/${filename}` },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Buyer profile picture uploaded successfully',
        data: {
          buyerProfileImage: updatedProfile.buyerProfileImage,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user profile picture
// @route   GET /api/profile-pictures/user
// @access  Private
exports.getUserProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get buyer profile picture
// @route   GET /api/profile-pictures/buyer
// @access  Private
exports.getBuyerProfilePicture = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    
    res.json({
      success: true,
      data: {
        buyerProfileImage: profile?.buyerProfileImage || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user profile picture
// @route   DELETE /api/profile-pictures/user
// @access  Private
exports.deleteUserProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.profilePicture) {
      const filepath = path.join('uploads', 'profile-pictures', 'user', path.basename(user.profilePicture));
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: null },
      { new: true }
    );

    res.json({
      success: true,
      message: 'User profile picture deleted successfully',
      data: {
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete buyer profile picture
// @route   DELETE /api/profile-pictures/buyer
// @access  Private
exports.deleteBuyerProfilePicture = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    
    if (profile?.buyerProfileImage) {
      const filepath = path.join('uploads', 'profile-pictures', 'buyer', path.basename(profile.buyerProfileImage));
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { buyerProfileImage: null },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Buyer profile picture deleted successfully',
      data: {
        buyerProfileImage: updatedProfile?.buyerProfileImage || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadUserProfilePicture: exports.uploadUserProfilePicture,
  uploadBuyerProfilePicture: exports.uploadBuyerProfilePicture,
  getUserProfilePicture: exports.getUserProfilePicture,
  getBuyerProfilePicture: exports.getBuyerProfilePicture,
  deleteUserProfilePicture: exports.deleteUserProfilePicture,
  deleteBuyerProfilePicture: exports.deleteBuyerProfilePicture,
};





