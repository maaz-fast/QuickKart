const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
