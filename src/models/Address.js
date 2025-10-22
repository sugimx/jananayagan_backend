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
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
  },
  addressLine1: {
    type: String,
    required: [true, 'Please add address line 1'],
  },
  city: {
    type: String,
    required: [true, 'Please add city'],
  },
  state: {
    type: String,
    required: [true, 'Please add state'],
  },
  district: {
    type: String,
    required: [true, 'Please add district'],
  },
  postalCode: {
    type: String,
    required: [true, 'Please add postal code'],
  },
  country: {
    type: String,
    default: 'India',
  },
 landmark: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Address', addressSchema);
