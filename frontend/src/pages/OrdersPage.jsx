import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'var(--warning)';
      case 'Processing': return 'var(--primary-light)';
      case 'Shipped': return '#3498db';
      case 'Delivered': return 'var(--success)';
      case 'Cancelled': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="skeleton-text" style={{ width: '200px', height: '32px' }} />
        <div style={{ marginTop: '24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="empty-state" data-testid="orders-empty-state">
          <span className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '60px', height: '60px' }}>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </span>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your history!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <div className="page-header">
        <h1 data-testid="orders-page-title">
          My Orders 
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.9em', height: '0.9em', verticalAlign: 'middle', marginLeft: '12px', color: 'var(--primary-light)' }}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </h1>
        <p>Manage and track your recent orders</p>
      </div>

      <div className="orders-list" data-testid="orders-list">
        {orders.map((order) => (
          <div 
            key={order._id} 
            className="order-summary-card" 
            onClick={() => navigate(`/orders/${order._id}`)}
            data-testid={`order-card-${order._id}`}
          >
            <div className="order-main-info">
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </span>
              <span className="order-id-short">ID: {order._id.slice(-8).toUpperCase()}</span>
            </div>

            <div className="order-details-preview">
              <span className="order-item-count">{order.orderItems.length} items</span>
              <span className="order-total-price-sm">${order.totalAmount.toFixed(2)}</span>
            </div>

            <div className="order-status-badge">
              <span 
                className="status-dot" 
                style={{ backgroundColor: getStatusColor(order.status) }} 
              />
              {order.status}
            </div>
            
            <button className="btn btn-sm btn-outline">Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
