/**
 * Helper utility to determine the target route when clicking a notification.
 * 
 * @param {Object} notification - Notification object containing message, type, etc.
 * @param {Object} user - Current user object
 * @returns {string} Path string for react-router navigation (e.g. '/orders/12345')
 */
export const getNotificationTargetUrl = (notification, user) => {
  if (!notification) return '/notifications';

  const role = user?.role || 'customer';
  const msg = notification.message || '';

  // Extract 24-character MongoDB ObjectId if present in the message
  const mongoIdMatch = msg.match(/\b([a-fA-F0-9]{24})\b/);
  const rawId = mongoIdMatch ? mongoIdMatch[1] : null;

  // 1. Order notifications
  if (notification.type === 'order' || msg.toLowerCase().includes('order')) {
    if (role === 'admin') {
      return '/admin/orders';
    }
    return rawId ? `/orders/${rawId}` : '/orders';
  }

  // 2. User account / profile notifications
  if (notification.type === 'user' || msg.toLowerCase().includes('profile') || msg.toLowerCase().includes('password')) {
    if (role === 'admin') {
      return '/admin/users';
    }
    return '/profile';
  }

  // 3. Support / Ticket notifications
  if (msg.toLowerCase().includes('ticket') || msg.toLowerCase().includes('support')) {
    if (role === 'admin') {
      return '/admin/support';
    }
    return '/contact';
  }

  // 4. Default fallback
  if (role === 'admin') {
    return '/admin/dashboard';
  }
  return '/orders';
};
