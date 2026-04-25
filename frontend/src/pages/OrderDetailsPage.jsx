import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import BrandedLoader from '../components/common/BrandedLoader';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const colorMap = {
    Pending: '#f59e0b',
    Processing: '#3b82f6',
    Shipped: '#6366f1',
    Delivered: '#10b981',
    Cancelled: '#ef4444',
  };
  return (
    <span
      className="invoice-status-badge"
      style={{
        background: colorMap[status] || '#94a3b8',
        color: '#fff',
        padding: '4px 14px',
        borderRadius: '100px',
        fontWeight: 700,
        fontSize: '0.8rem',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef(null);

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <BrandedLoader fullPage message="Reviewing Shipment Details..." />;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!order) return <div className="container">Order not found.</div>;

  const subtotal = order.totalAmount - order.taxAmount - order.shippingPrice;
  const orderDate = new Date(order.createdAt);

  return (
    <div className="container order-details-page">
      {/* ── Controls (hidden on print) ── */}
      <div className="order-controls no-print">
        <Link to={user?.role === 'admin' ? "/admin/orders" : "/orders"} className="back-link">
          {user?.role === 'admin' ? "← Back to All Orders" : "← Back to My Orders"}
        </Link>
        {user?.role !== 'admin' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handlePrint}
            data-testid="download-invoice-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Invoice
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════
          BRANDED INVOICE (printable section)
          ══════════════════════════════════════ */}
      <div className="invoice-wrapper" ref={invoiceRef} data-testid="invoice-section">

        {/* Order Header */}
        <div className="invoice-header">
          {user?.role !== 'admin' ? (
            <div className="invoice-brand">
              <div className="invoice-logo-gradient">⚡</div>
              <div>
                <h1 className="invoice-brand-name">QuickKart</h1>
                <p className="invoice-brand-tagline">Your Smart Shopping Destination</p>
              </div>
            </div>
          ) : (
            <div className="invoice-brand">
              <div>
                <h1 className="invoice-brand-name" style={{ fontSize: '2rem' }}>Order Management</h1>
                <p className="invoice-brand-tagline">Reviewing Customer Order Details</p>
              </div>
            </div>
          )}
          <div className="invoice-meta">
            <h2 className="invoice-title">{user?.role === 'admin' ? 'ORDER SUMMARY' : 'INVOICE'}</h2>
            <table className="invoice-meta-table">
              <tbody>
                <tr>
                  <td>Order #</td>
                  <td><strong>ORD-{order._id.slice(-8).toUpperCase()}</strong></td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>{orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td><StatusBadge status={order.status} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Divider */}
        <div className="invoice-divider" />

        {/* Bill To / Ship To */}
        <div className="invoice-addresses">
          <div className="invoice-address-block">
            <p className="invoice-section-label">BILLED TO</p>
            <p className="invoice-address-name">{user?.name || order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName}</p>
            <p className="invoice-address-text">{user?.email}</p>
          </div>
          <div className="invoice-address-block">
            <p className="invoice-section-label">SHIPPED TO</p>
            <p className="invoice-address-name">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p className="invoice-address-text">{order.shippingAddress.address}</p>
            <p className="invoice-address-text">{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
            <p className="invoice-address-text">{order.shippingAddress.country}</p>
            <p className="invoice-address-text">📞 {order.shippingAddress.phone}</p>
          </div>
          <div className="invoice-address-block">
            <p className="invoice-section-label">ORDER INFO</p>
            <p className="invoice-address-text">Order ID:</p>
            <p className="invoice-order-id" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>ORD-{order._id.slice(-8).toUpperCase()}</p>
            <p className="invoice-address-text" style={{ marginTop: '8px' }}>Payment: {order.paymentMethod || 'Card'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-items">
          <table className="invoice-table" data-testid="invoice-items-table">
            <thead>
              <tr>
                <th className="invoice-th" style={{ width: '50%' }}>Product</th>
                <th className="invoice-th" style={{ textAlign: 'center' }}>Qty</th>
                <th className="invoice-th" style={{ textAlign: 'right' }}>Unit Price</th>
                <th className="invoice-th" style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item._id} className="invoice-tr" data-testid={`invoice-item-${item.product}`}>
                  <td className="invoice-td">
                    <div className="invoice-product-cell">
                      <img src={item.image} alt={item.name} className="invoice-product-img" />
                      <span className="invoice-product-name">{item.name}</span>
                    </div>
                  </td>
                  <td className="invoice-td" style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td className="invoice-td" style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                  <td className="invoice-td invoice-td-total" style={{ textAlign: 'right' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="invoice-totals-wrapper">
          <div className="invoice-totals">
            <div className="invoice-total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="invoice-total-row">
              <span>Tax</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="invoice-total-row">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="invoice-total-row invoice-grand-total">
              <span>Grand Total</span>
              <span data-testid="invoice-grand-total">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {user?.role !== 'admin' ? (
          <div className="invoice-footer">
            <div className="invoice-footer-gradient" />
            <p className="invoice-footer-text">Thank you for shopping with <strong>QuickKart</strong>! 🛒</p>
            <p className="invoice-footer-subtext">For support, contact us at support@quickkart.com</p>
          </div>
        ) : (
          <div className="invoice-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
             <p className="invoice-footer-text">Customer Order Record - Admin View</p>
          </div>
        )}

      </div>
      {/* ── End Invoice ── */}
    </div>
  );
};

export default OrderDetailsPage;
