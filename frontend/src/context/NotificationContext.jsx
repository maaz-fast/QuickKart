import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { getNotificationTargetUrl } from '../utils/notificationNavigation';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch initial notification history via REST
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setSocketConnected(false);
      return;
    }

    fetchNotifications();

    const token = localStorage.getItem('quickkart_token');
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('notification:new', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      const formattedMsg = (newNotification.message || '').replace(
        /\b([a-fA-F0-9]{24})\b/g,
        (match) => 'ORD-' + match.slice(-8).toUpperCase()
      );

      const targetUrl = getNotificationTargetUrl(newNotification, user);

      toast.info(`🔔 ${formattedMsg}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        onClick: () => {
          if (targetUrl) {
            window.location.href = targetUrl;
          }
        },
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      fetchNotifications();
    }
  };

  const refreshNotifications = () => {
    if (user) fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        socketConnected,
        markAsRead,
        markAllAsRead,
        refreshNotifications
      }}
    >
      <div data-testid="notification-socket-status" data-connected={socketConnected ? "true" : "false"} style={{ display: 'none' }} />
      {children}
    </NotificationContext.Provider>
  );
};
