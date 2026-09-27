const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../config/socket');

/**
 * Creates a notification for a specific user and emits via WebSocket
 * @param {string} userId - ID of the user to notify
 * @param {string} message - Notification text
 * @param {string} type - Notification type ('order', 'user', 'system')
 */
const createNotification = async (userId, message, type = 'system') => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
    });

    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error.message);
    return null;
  }
};

/**
 * Creates a notification for all admin users and emits via WebSocket
 * @param {string} message - Notification text
 * @param {string} type - Notification type ('order', 'user', 'system')
 */
const notifyAdmins = async (message, type = 'system') => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    if (!admins || admins.length === 0) {
      return null;
    }

    const notifications = admins.map(admin => ({
      userId: admin._id,
      message,
      type,
    }));

    const result = await Notification.insertMany(notifications);

    const io = getIO();
    if (io && result.length > 0) {
      io.to('admins').emit('notification:new', result[0]);
    }

    return result;
  } catch (error) {
    console.error('Failed to broadcast notification to admins:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
  notifyAdmins
};
