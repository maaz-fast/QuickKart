const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Creates a notification for a specific user
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
    return notification;
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error.message);
    return null;
  }
};

/**
 * Creates a notification for all admin users
 * @param {string} message - Notification text
 * @param {string} type - Notification type ('order', 'user', 'system')
 */
const notifyAdmins = async (message, type = 'system') => {
  try {
    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    if (!admins || admins.length === 0) {
      return null;
    }

    // Prepare notifications array
    const notifications = admins.map(admin => ({
      userId: admin._id,
      message,
      type,
    }));

    // Bulk insert for efficiency
    const result = await Notification.insertMany(notifications);
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
