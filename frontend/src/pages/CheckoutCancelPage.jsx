import { useSearchParams, useNavigate } from 'react-router-dom';

const CheckoutCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="empty-state">
        <span className="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', color: 'var(--error)' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </span>
        <h2>Payment Cancelled or Failed</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Your Safepay checkout session was not completed. You can try checking out again or view your cart.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/cart')}>
            Return to Cart
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
