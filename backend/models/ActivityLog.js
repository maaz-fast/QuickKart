const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent editing or deleting logs
activityLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Activity logs are immutable and cannot be updated.'));
  }
  next();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
