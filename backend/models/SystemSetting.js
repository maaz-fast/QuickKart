const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
