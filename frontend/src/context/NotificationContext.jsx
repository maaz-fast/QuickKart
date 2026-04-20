import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (!user) return;
    
    if (!isPolling) setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [user]);

  // Initial fetch and Setup Polling
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time polling every 15 seconds
      const intervalId = setInterval(() => {
        fetchNotifications(true); // true = silent polling, no loading state
      }, 15000);
      
      return () => clearInterval(intervalId);
    } else {
      // Clear notifications on logout
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Make API call
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      // Revert on failure
      fetchNotifications();
    }
  };

  // Allow triggering a refetch from other components (like after creating an order)
  const refreshNotifications = () => {
    if (user) fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
