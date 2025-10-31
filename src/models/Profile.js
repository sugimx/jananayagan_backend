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


// Ensure consistent date formatting in API responses
const formatDateYMDWithSlashes = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

profileSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.dateOfBirth) ret.dateOfBirth = formatDateYMDWithSlashes(ret.dateOfBirth);
    if (ret.createdAt) ret.createdAt = formatDateYMDWithSlashes(ret.createdAt);
    if (ret.updatedAt) ret.updatedAt = formatDateYMDWithSlashes(ret.updatedAt);
    return ret;
  }
});

profileSchema.set('toObject', {
  transform: (doc, ret) => {
    if (ret.dateOfBirth) ret.dateOfBirth = formatDateYMDWithSlashes(ret.dateOfBirth);
    if (ret.createdAt) ret.createdAt = formatDateYMDWithSlashes(ret.createdAt);
    if (ret.updatedAt) ret.updatedAt = formatDateYMDWithSlashes(ret.updatedAt);
    return ret;
  }
});

module.exports = mongoose.model('Profile', profileSchema);
