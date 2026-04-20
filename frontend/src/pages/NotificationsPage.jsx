import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import BrandedLoader from '../components/common/BrandedLoader';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, refreshNotifications } = useNotification();

  useEffect(() => {
    refreshNotifications();
    // eslint-disable-next-line
  }, []);

  if (loading && notifications.length === 0) {
    return <BrandedLoader fullPage message="Loading Notifications..." />;
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1>Your Notifications</h1>
        <p>Stay updated on your account activity and orders</p>
      </div>

      <div className="notification-page-list">
        {notifications.length === 0 ? (
          <div className="admin-card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>No notifications yet</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>We'll let you know when something happens!</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Return to Home</Link>
          </div>
        ) : (
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ padding: '20px', display: 'flex', alignItems: 'center' }}
              >
                <div className="notification-icon-type" style={{ width: '48px', height: '48px', fontSize: '1.5rem', marginRight: '20px' }}>
                  {notification.type === 'order' && '📦'}
                  {notification.type === 'user' && '👤'}
                  {notification.type === 'system' && '🔔'}
                </div>
                <div className="notification-content">
                  <p className="notification-message" style={{ fontSize: '1rem' }}>{notification.message}</p>
                  <span className="notification-time">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {!notification.isRead && <span className="unread-dot" style={{ position: 'static', marginLeft: '16px' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
