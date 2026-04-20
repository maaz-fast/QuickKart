const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { createNotification } = require('../utils/notificationService');

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const exists = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (exists) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }

    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    const populatedItem = await Wishlist.findById(wishlistItem._id).populate(
      'product',
      'name price image stock category'
    );

    // Notify the user
    await createNotification(
      req.user._id,
      `Product added to your wishlist`,
      'system'
    );

    res.status(201).json({
      success: true,
      wishlistItem: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user._id }).populate(
      'product',
      'name price image stock category'
    );

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlistItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlistItem = await Wishlist.findById(req.params.id);

    if (!wishlistItem) {
      res.status(404);
      throw new Error('Wishlist item not found');
    }

    // Ensure the user owns the wishlist item
    if (wishlistItem.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to remove this item');
    }

    await wishlistItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
