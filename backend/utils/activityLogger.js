const ActivityLog = require('../models/ActivityLog');

/**
 * Log a meaningful business activity
 * @param {Object} user - The user object (must contain _id and role)
 * @param {string} action - Standardized action type (e.g., 'LOGIN', 'PLACE_ORDER')
 * @param {string} description - Human-readable message
 * @param {Object} [metadata] - Optional related IDs or data
 */
const logActivity = async (user, action, description, metadata = {}) => {
  try {
    if (!user || !user._id) {
      console.warn(`Activity Logging failed: No user provided for action ${action}`);
      return;
    }

    await ActivityLog.create({
      userId: user._id,
      role: user.role || 'user',
      action: action.toUpperCase(),
      description,
      metadata,
    });
  } catch (error) {
    console.error(`Activity Logging Error [${action}]:`, error.message);
    // We don't throw the error to avoid breaking the main API flow
  }
};

module.exports = { logActivity };
