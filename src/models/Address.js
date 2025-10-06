const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  fullName: {
    type: String,
    required: [true, 'Please add full name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please add address line 1'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please add city'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'Please add state'],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Please add postal code'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Please add country'],
    trim: true,
    default: 'India',
  },
  landmark: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

// Index for faster queries
addressSchema.index({ user: 1 });

// Middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('Address', addressSchema);
