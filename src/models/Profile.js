const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth'],
  },
  profileImage: {
    type: String,
    default: null,
  },
  // Buyer profile picture (allows duplicates)
  buyerProfileImage: {
    type: String,
    default: null,
  },
  // Profile picture hash for duplicate detection
  profileImageHash: {
    type: String,
    sparse: true,
  }
}, {
  timestamps: true,
});

// Index for faster queries
profileSchema.index({ user: 1 });
profileSchema.index({ profileImageHash: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Profile', profileSchema);
