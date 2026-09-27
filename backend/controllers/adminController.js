const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Support = require('../models/Support');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');
const { createNotification } = require('../utils/notificationService');
const { logActivity } = require('../utils/activityLogger');
const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

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

    const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;

    // Notify the user about the status update in real-time via Socket.io
    await createNotification(
      updatedOrder.user,
      `Your order ${formattedOrderId} status has been updated to ${status}`,
      'order'
    );

    // Send email notification to user asynchronously
    const targetUser = await User.findById(updatedOrder.user).select('email');
    if (targetUser && targetUser.email) {
      sendOrderStatusUpdateEmail(targetUser.email, updatedOrder, status).catch(err => console.error('Status update email failed:', err));
    }

    res.status(200).json({ success: true, order: updatedOrder });

    // Log Activity
    await logActivity(req.user, 'ADMIN_UPDATE_ORDER_STATUS', `Order ${formattedOrderId} status updated to ${status}`, { orderId: order._id, status });
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

    // Log Activity
    await logActivity(req.user, 'ADMIN_VIEW_USERS', 'Admin viewed user directory');
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

    // Log Activity
    await logActivity(req.user, 'ADMIN_ADD_PRODUCT', `Admin created product: ${createdProduct.name}`, { productId: createdProduct._id });
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

    // Log Activity
    await logActivity(req.user, 'ADMIN_UPDATE_PRODUCT', `Admin updated product: ${updatedProduct.name}`, { productId: updatedProduct._id });
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

    // Log Activity
    await logActivity(req.user, 'ADMIN_DELETE_PRODUCT', `Admin deleted product: ${product.name}`, { productId: product._id });
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

// @desc    Get all activity logs (Admin)
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      action,
      startDate,
      endDate
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    const query = {};
    if (role) query.role = role;
    if (action) query.action = { $regex: action.toUpperCase(), $options: 'i' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const totalCount = await ActivityLog.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit));

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email profileImage avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      totalCount,
      totalPages,
      currentPage: Number(page),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

const SystemSetting = require('../models/SystemSetting');

// @desc    Get Swagger password configuration
// @route   GET /api/admin/swagger-password
// @access  Private/Admin
const getSwaggerPasswordSetting = async (req, res, next) => {
  try {
    const setting = await SystemSetting.findOne({ key: 'swagger_password' });
    const password = setting ? setting.value : (process.env.SWAGGER_PASSWORD || 'quickkart2026');

    res.status(200).json({
      success: true,
      swaggerPassword: password,
      isCustomized: !!setting,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Swagger password configuration
// @route   PUT /api/admin/swagger-password
// @access  Private/Admin
const updateSwaggerPasswordSetting = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      res.status(400);
      throw new Error('Current password is required');
    }

    if (!newPassword || newPassword.trim().length < 4) {
      res.status(400);
      throw new Error('New password must be at least 4 characters long');
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error('New password and confirm password do not match');
    }

    // Verify current password
    const existingSetting = await SystemSetting.findOne({ key: 'swagger_password' });
    const actualCurrentPassword = existingSetting ? existingSetting.value : (process.env.SWAGGER_PASSWORD || 'quickkart2026');

    if (currentPassword !== actualCurrentPassword) {
      res.status(400);
      throw new Error('Incorrect current password');
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key: 'swagger_password' },
      { value: newPassword.trim(), description: 'Swagger API documentation access password' },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Swagger API documentation password updated successfully',
    });

    // Log Activity
    await logActivity(req.user, 'ADMIN_UPDATE_SWAGGER_PASSWORD', 'Admin updated Swagger API documentation access password');
  } catch (error) {
    next(error);
  }
};

// Helper function to parse CSV lines safely
function parseCSVRows(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push({ rowNumber: i + 1, data: rowObj });
  }

  return rows;
}

// @desc    Export products as CSV
// @route   GET /api/admin/products/export
// @access  Private/Admin
const exportProductsCSV = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('category').sort({ createdAt: -1 });

    const headers = ['name', 'description', 'price', 'category', 'stock', 'image'];
    const rows = products.map((p) => {
      const name = `"${(p.name || '').replace(/"/g, '""')}"`;
      const description = `"${(p.description || '').replace(/"/g, '""')}"`;
      const price = p.price;
      const category = `"${(p.category?.name || 'Uncategorized').replace(/"/g, '""')}"`;
      const stock = p.stock;
      const image = `"${(p.image || '').replace(/"/g, '""')}"`;
      return [name, description, price, category, stock, image].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quickkart_products.csv"');
    res.status(200).send(csvString);

    await logActivity(req.user, 'EXPORT_PRODUCTS_CSV', `Exported ${products.length} products to CSV`);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import products from CSV
// @route   POST /api/admin/products/import
// @access  Private/Admin
const importProductsCSV = async (req, res, next) => {
  try {
    let csvText = '';

    if (req.file) {
      csvText = req.file.buffer.toString('utf8');
    } else if (req.body.csvText) {
      csvText = req.body.csvText;
    } else if (typeof req.body === 'string') {
      csvText = req.body;
    }

    if (!csvText || !csvText.trim()) {
      res.status(400);
      throw new Error('No CSV file or content provided');
    }

    const parsedRows = parseCSVRows(csvText);
    if (parsedRows.length === 0) {
      res.status(400);
      throw new Error('CSV file is empty or missing valid headers (name, price, category, etc.)');
    }

    let createdCount = 0;
    let updatedCount = 0;
    const failedRows = [];

    for (const item of parsedRows) {
      const { rowNumber, data } = item;
      const name = data.name;
      const description = data.description || name || 'No description';
      const rawPrice = data.price;
      const categoryName = data.category || 'General';
      const rawStock = data.stock;
      const image = data.image || data.imageurl || 'https://via.placeholder.com/300';

      if (!name || rawPrice === undefined || rawPrice === '') {
        failedRows.push({ row: rowNumber, name: name || 'N/A', reason: 'Missing required field: name or price' });
        continue;
      }

      const price = Number(rawPrice);
      if (isNaN(price) || price < 0) {
        failedRows.push({ row: rowNumber, name, reason: `Invalid price value: ${rawPrice}` });
        continue;
      }

      const stock = rawStock !== undefined && rawStock !== '' ? Number(rawStock) : 100;
      if (isNaN(stock) || stock < 0) {
        failedRows.push({ row: rowNumber, name, reason: `Invalid stock value: ${rawStock}` });
        continue;
      }

      // Lookup or create Category
      let categoryDoc = await Category.findOne({ name: { $regex: `^${categoryName.trim()}$`, $options: 'i' } });
      if (!categoryDoc) {
        categoryDoc = await Category.create({ name: categoryName.trim(), description: `${categoryName.trim()} category` });
      }

      // Upsert Product by name + category
      let product = await Product.findOne({ name: name.trim(), category: categoryDoc._id });

      if (product) {
        product.price = price;
        product.description = description;
        product.stock = stock;
        if (image) product.image = image;
        await product.save();
        updatedCount++;
      } else {
        await Product.create({
          name: name.trim(),
          description,
          price,
          category: categoryDoc._id,
          stock,
          image,
        });
        createdCount++;
      }
    }

    await logActivity(req.user, 'IMPORT_PRODUCTS_CSV', `Bulk imported products via CSV: ${createdCount} created, ${updatedCount} updated, ${failedRows.length} failed`, {
      createdCount,
      updatedCount,
      failedCount: failedRows.length,
    });

    res.status(200).json({
      success: true,
      summary: {
        createdCount,
        updatedCount,
        failedCount: failedRows.length,
        totalProcessed: parsedRows.length,
        failedRows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for Admin panel
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAdminPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const statusFilter = req.query.status;
    const methodFilter = req.query.method;
    const search = req.query.search;

    let query = {};

    if (statusFilter && statusFilter !== 'All') {
      if (statusFilter === 'paid') query.paymentStatus = 'paid';
      else if (statusFilter === 'pending') query.paymentStatus = 'pending';
      else if (statusFilter === 'failed') query.paymentStatus = 'failed';
    }

    if (methodFilter && methodFilter !== 'All') {
      query.paymentMethod = new RegExp(methodFilter, 'i');
    }

    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      const searchRegex = new RegExp(cleanSearch, 'i');

      // Find users matching name or email
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      const searchConditions = [
        { safepayToken: searchRegex },
        { paymentMethod: searchRegex },
        { user: { $in: userIds } },
      ];

      // Handle order ID search (e.g. ORD-F2F21A65 or raw hex string)
      const strippedId = cleanSearch.replace(/^ORD-/i, '');
      if (mongoose.Types.ObjectId.isValid(cleanSearch)) {
        searchConditions.push({ _id: cleanSearch });
      } else if (strippedId.length >= 3) {
        const matchingOrders = await Order.find({}).select('_id');
        const matchedOrderIds = matchingOrders
          .filter((o) => o._id.toString().toUpperCase().endsWith(strippedId.toUpperCase()) || o._id.toString().toLowerCase().includes(strippedId.toLowerCase()))
          .map((o) => o._id);
        if (matchedOrderIds.length > 0) {
          searchConditions.push({ _id: { $in: matchedOrderIds } });
        }
      }

      query.$or = searchConditions;
    }

    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(query)
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // KPI Metrics calculation across all orders
    const paidAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          avgValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const totalVolume = paidAggregation.length > 0 ? paidAggregation[0].totalVolume : 0;
    const paidCount = paidAggregation.length > 0 ? paidAggregation[0].count : 0;
    const avgValue = paidAggregation.length > 0 ? paidAggregation[0].avgValue : 0;

    const pendingCount = await Order.countDocuments({ paymentStatus: 'pending' });
    const failedCount = await Order.countDocuments({ paymentStatus: 'failed' });

    res.status(200).json({
      success: true,
      totalCount,
      totalPages,
      currentPage: page,
      stats: {
        totalVolume,
        paidCount,
        pendingCount,
        failedCount,
        avgValue,
      },
      payments: orders,
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
  getAdminCounts,
  getActivityLogs,
  getAdminPayments,
  getSwaggerPasswordSetting,
  updateSwaggerPasswordSetting,
  exportProductsCSV,
  importProductsCSV,
};

