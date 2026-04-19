import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '40px' }}><div className="spinner" /></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!order) return <div className="container">Order not found.</div>;

  return (
    <div className="container order-details-page">
      <Link to="/orders" className="back-link">← Back to My Orders</Link>
      
      <div className="page-header" style={{ marginTop: '20px' }}>
        <h1 data-testid="order-details-title">
          Order Details 
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.9em', height: '0.9em', verticalAlign: 'middle', marginLeft: '12px' }}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M9 2h6" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
        </h1>
        <p>Order ID: <span style={{ color: 'var(--primary-light)' }}>{order._id}</span> • {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="order-details-grid">
        <div className="order-content">
          <div className="order-card">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '10px' }}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Order Items
            </h3>
            <div className="order-items-table">
              {order.orderItems.map((item) => (
                <div key={item._id} className="order-detail-item" data-testid={`order-item-${item.product}`}>
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-card" style={{ marginTop: '20px' }}>
            <h3>📦 Shipping Address</h3>
            <div className="shipping-info-display">
              <p><strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong></p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>📞 {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        <div className="order-summary-sidebar">
          <div className="order-card summary-card">
            <h3>Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${(order.totalAmount - order.taxAmount - order.shippingPrice).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Order Total</span>
              <span data-testid="order-total">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="status-box" style={{ marginTop: '20px' }}>
              <label>Status</label>
              <div className="status-indicator" data-testid="order-status">
                {order.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
