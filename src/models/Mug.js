const mongoose = require('mongoose');

const mugAssignmentSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mugId: {
    type: Number,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

mugAssignmentSchema.index({ profile: 1, mugId: 1 }, { unique: true });
mugAssignmentSchema.index({ order: 1 });
mugAssignmentSchema.index({ user: 1 });

module.exports = mongoose.model('Mug', mugAssignmentSchema);

