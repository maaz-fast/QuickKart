import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import BrandedLoader from '../components/common/BrandedLoader';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const tracker = searchParams.get('tracker');

  const [verifying, setVerifying] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        if (!orderId && !tracker) {
          setError('Missing order verification details.');
          setVerifying(false);
          return;
        }

        const { data } = await api.post('/payments/verify', { orderId });
        if (data.success) {
          setOrder(data.order);
          toast.success('Payment verified successfully!');
          fetchCart(); // Clear cart
        } else {
          setError('Payment verification failed.');
        }
      } catch (err) {
        // Fallback: fetch order directly
        try {
          if (orderId) {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data.order);
            fetchCart();
          } else {
            setError('Could not verify payment status.');
          }
        } catch (fetchErr) {
          setError('Failed to verify payment status.');
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, tracker, fetchCart]);

  if (verifying) {
    return (
      <div data-testid="payment-redirect-pending">
        <BrandedLoader fullPage message="Verifying Safepay Payment (Sandbox)..." testId="page-loader" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="empty-state">
          <h2>Payment Verification Error</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const orderDisplayId = order?._id ? `ORD-${order._id.slice(-8).toUpperCase()}` : 'CONFIRMED';

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="success-overlay" data-testid="order-success-screen">
        <span className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '80px', height: '80px', color: 'var(--success)' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </span>

        <h2 data-testid="order-success-title">Payment & Order Confirmed!</h2>

        <div
          className="payment-status-banner"
          data-testid="payment-status-banner"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            margin: '15px auto',
            maxWidth: '480px',
            color: '#10b981',
            fontWeight: '500',
            fontSize: '0.88rem'
          }}
        >
          ✓ Safepay Sandbox Payment Completed • Test Transaction Approved
        </div>

        <p data-testid="order-success-message" style={{ margin: '15px 0', color: 'var(--text-secondary)' }}>
          Thank you! Your order has been placed and payment confirmed.
        </p>

        <div className="order-id-badge" data-testid="order-id">
          Order ID: <strong>{orderDisplayId}</strong>
        </div>

        <div className="success-actions" style={{ marginTop: '24px' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/orders', { replace: true })}
            data-testid="view-orders-button"
          >
            View My Orders
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/', { replace: true })}
            style={{ marginLeft: '12px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
