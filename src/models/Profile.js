const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  profileType: {
    type: String,
    enum: ['user', 'buyer'],
    default: 'user',
    required: true,
  },
  name: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  dateOfBirth: {
    type: Date,
    required: false,
    default: null,
  },
  profileImage: {
    type: String,
    default: null,
  },

  phone: {
    type: String,
    required: false,
    trim: true,
    sparse: true,
  },
  gmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active',
  },
  dist: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  state: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound index: one user can have only one 'user' profile type, but multiple 'buyer' profiles
profileSchema.index({ user: 1, profileType: 1 }, { 
  unique: true, 
  partialFilterExpression: { profileType: 'user' } 
});

// Index for faster queries
profileSchema.index({ user: 1 });


module.exports = mongoose.model('Profile', profileSchema);
