const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logActivity } = require('../utils/activityLogger');

// @desc    Add item to cart (or update quantity if exists)
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if item already in cart — update quantity if so
    const existingItem = await Cart.findOne({
      userId: req.user._id,
      productId,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      const populated = await existingItem.populate('productId');
      // Log Activity
      await logActivity(req.user, 'ADD_TO_CART', `Updated cart quantity for: ${populated.productId.name}`, { productId: populated.productId._id, quantity: populated.quantity });

      return res.status(200).json({
        success: true,
        message: 'Cart quantity updated',
        cartItem: populated,
      });
    }

    // Create new cart entry
    const cartItem = await Cart.create({
      userId: req.user._id,
      productId,
      quantity,
    });

    const populated = await cartItem.populate('productId');

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cartItem: populated,
    });

    // Log Activity
    await logActivity(req.user, 'ADD_TO_CART', `Added to cart: ${populated.productId.name}`, { productId: populated.productId._id, quantity: populated.quantity });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400);
      return next(new Error('Invalid product ID format'));
    }
    next(error);
  }
};

// @desc    Get all cart items for logged-in user
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id }).populate(
      'productId',
      'name price image description'
    );

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      count: cartItems.length,
      total: parseFloat(total.toFixed(2)),
      cartItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    // Ensure user owns this cart item
    if (cartItem.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to remove this item');
    }

    await cartItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });

    // Log Activity
    await logActivity(req.user, 'REMOVE_FROM_CART', 'User removed item from cart', { cartId: req.params.id });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400);
      return next(new Error('Invalid cart item ID format'));
    }
    next(error);
  }
};

module.exports = { addToCart, getCart, removeFromCart };
