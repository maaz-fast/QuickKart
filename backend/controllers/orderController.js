const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { createNotification, notifyAdmins } = require('../utils/notificationService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalAmount,
      taxAmount,
      shippingPrice 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      taxAmount,
      shippingPrice
    });

    const createdOrder = await order.save();

    // Clear user's cart in DB after successful order
    await Cart.deleteMany({ userId: req.user._id });

    // Notify User and Admins
    await createNotification(req.user._id, 'Your order has been placed successfully', 'order');
    await notifyAdmins(`New order received from ${req.user.name || req.user.email}`, 'order');

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages,
      currentPage: page,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Authorization check: ensure user owns the order OR is an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400);
      return next(new Error('Invalid order ID format'));
    }
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
