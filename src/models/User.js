const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    required: false,
    select: false,
    validate: {
      validator: function(value) {
        // If password is provided, it must be at least 6 characters
        // If undefined, null, or empty string, that's fine for social auth users
        return value === undefined || value === null || value === '' || value.length >= 6;
      },
      message: 'Password must be at least 6 characters'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Social authentication fields
  googleId: {
    type: String,
    sparse: true,
  },
  // Profile picture
  profilePicture: {
    type: String,
    default: null,
  },
  // Profile completion status
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    return false; // Social auth users don't have passwords
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

