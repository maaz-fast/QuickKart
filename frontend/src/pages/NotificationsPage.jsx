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
                <div className="notification-icon-type" style={{ width: '48px', height: '48px', fontSize: '1.5rem', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notification.type === 'order' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                    </svg>
                  )}
                  {notification.type === 'user' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                  {notification.type === 'system' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                  )}
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
