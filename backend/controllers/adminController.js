const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Support = require('../models/Support');
const { createNotification } = require('../utils/notificationService');

// @desc    Get dashboard metrics and chart data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const pendingSupport = await Support.countDocuments({ status: 'Pending' });
    
    // Total Revenue
    const revenueData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Order status distribution
    const statusData = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue History Aggregation
    const { period } = req.query;
    let dateFilter = { isPaid: true };
    let groupFormat = '%Y-%m'; // Default: Monthly

    if (period === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter.createdAt = { $gte: sevenDaysAgo };
      groupFormat = '%Y-%m-%d';
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
      groupFormat = '%Y-%m-%d';
    } else if (period && period !== 'last6' && period !== 'undefined') {
      // It's a specific year
      const startOfYear = new Date(`${period}-01-01`);
      const endOfYear = new Date(`${Number(period) + 1}-01-01`);
      dateFilter.createdAt = { $gte: startOfYear, $lt: endOfYear };
      groupFormat = '%Y-%m';
    } else {
      // Default: last6 (or undefined)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter.createdAt = { $gte: sixMonthsAgo };
      groupFormat = '%Y-%m';
    }

    const salesHistory = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingSupport
      },
      statusDistribution: statusData,
      salesHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const totalCount = await Order.countDocuments({});
    const totalPages = Math.ceil(totalCount / Number(limit));

    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ 
      success: true, 
      count: orders.length, 
      totalCount,
      totalPages,
      currentPage: Number(page),
      orders 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.status === 'Delivered') {
      res.status(400);
      throw new Error('Order is already delivered and cannot be changed');
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Notify the user about the status update
    await createNotification(
      updatedOrder.user,
      `Your order status has been updated to ${status}`,
      'order'
    );

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const totalCount = await User.countDocuments({});
    const totalPages = Math.ceil(totalCount / Number(limit));

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ 
      success: true, 
      count: users.length, 
      totalCount,
      totalPages,
      currentPage: Number(page),
      users 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get advanced analytics: top products & orders per day
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    // Top 5 most ordered products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          totalOrdered: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 }
    ]);

    // Orders per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersPerDay = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      topProducts,
      ordersPerDay,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCounts = async (req, res, next) => {
  try {
    const pendingOrders = await Order.countDocuments({ status: { $ne: 'Delivered' } });
    const pendingSupport = await Support.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      counts: {
        pendingOrders,
        pendingSupport
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalytics,
  getAdminCounts
};
