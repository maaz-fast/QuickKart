const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { createNotification, notifyAdmins } = require('../utils/notificationService');
const { logActivity } = require('../utils/activityLogger');

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

    // Check stock availability for all items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
      }
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

    // Decrement stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user's cart in DB after successful order
    await Cart.deleteMany({ userId: req.user._id });

    // Notify User and Admins
    await createNotification(req.user._id, 'Your order has been placed successfully', 'order');
    await notifyAdmins(`New order received from ${req.user.name || req.user.email}`, 'order');

    res.status(201).json({
      success: true,
      order: createdOrder
    });

    // Log Activity
    await logActivity(req.user, 'PLACE_ORDER', `Order placed: ${createdOrder._id}`, { orderId: createdOrder._id, amount: createdOrder.totalAmount });
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
