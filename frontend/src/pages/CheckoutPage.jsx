import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import AddressBook from '../components/AddressBook';

const PhoneInput = PhoneInputPkg.default ? PhoneInputPkg.default : PhoneInputPkg;

const CheckoutPage = () => {
  const { cartItems, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const handleSelectAddress = (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr._id);
    const nameParts = (addr.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    setFormData((prev) => ({
      ...prev,
      firstName,
      lastName,
      phone: addr.phone || prev.phone,
      address: addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : ''),
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      zipCode: addr.postalCode || prev.zipCode,
      country: addr.country || prev.country,
    }));
  };

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: cartTotal,
      });
      if (data.success) {
        setAppliedCoupon(data.coupon);
        toast.success(`Coupon ${data.coupon.code} applied!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = Math.max(0, cartTotal - discountAmount);
  const tax = taxableAmount * 0.08;
  const shippingPrice = 0;
  const grandTotal = (taxableAmount + tax + shippingPrice).toFixed(2);

  // Redirect if cart is empty
  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const [paymentMethod, setPaymentMethod] = useState('safepay');
  const [redirectPending, setRedirectPending] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone || formData.phone.trim().length < 7) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = cartItems.map(item => ({
        product: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        image: item.productId.image
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: paymentMethod === 'safepay' ? 'Safepay (Sandbox)' : 'Cash on Delivery',
        totalAmount: Number(grandTotal),
        taxAmount: Number(tax.toFixed(2)),
        shippingPrice: Number(shippingPrice),
        couponCode: appliedCoupon ? appliedCoupon.code : '',
      };

      const { data: orderRes } = await api.post('/orders', orderData);
      const createdId = orderRes.order._id;
      setCreatedOrderId(createdId);

      if (paymentMethod === 'safepay') {
        setRedirectPending(true);
        try {
          const { data: payRes } = await api.post('/payments/create-session', { orderId: createdId });
          if (payRes.success && payRes.checkoutUrl) {
            toast.info('Redirecting to Safepay Hosted Checkout (Sandbox)...');
            setTimeout(() => {
              window.location.href = payRes.checkoutUrl;
            }, 1000);
            return;
          }
        } catch (payErr) {
          console.warn('Safepay checkout session failed, completing locally');
        }
      }

      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container">
        <div className="success-overlay" data-testid="order-success-screen">
          <span className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '80px', height: '80px', color: 'var(--success)' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </span>
          <h2 data-testid="order-success-title">Order Placed Successfully!</h2>
          <p data-testid="order-success-message">
            Thank you, <strong>{user?.name}</strong>! Your order has been confirmed.
          </p>
          <div className="order-id-badge" data-testid="order-id">
            Order ID: <strong>ORD-{createdOrderId.slice(-8).toUpperCase()}</strong>
          </div>
          <div className="success-actions">
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
  }

  return (
    <div className="container checkout-page">
      <div className="page-header">
        <h1 data-testid="checkout-page-title">
          Checkout
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.9em', height: '0.9em', verticalAlign: 'middle', marginLeft: '12px' }}>
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </h1>
        <p>Complete your order below</p>
      </div>

      <form onSubmit={handleSubmit} data-testid="checkout-form" noValidate>
        {/* Processing Overlay */}
        {(submitting || redirectPending) && (
          <div className="processing-overlay" data-testid={redirectPending ? "payment-redirect-pending" : "processing-order-overlay"}>
            <div className="processing-content">
              <span className="btn-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
              <h2>{redirectPending ? 'Redirecting to Safepay Checkout (Sandbox)...' : 'Processing Your Order...'}</h2>
              <p>Please do not close this page.</p>
            </div>
          </div>
        )}

        <div className="checkout-layout">
          <div>
            <div className="checkout-form-card">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '10px' }}>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
                Shipping Information
              </h2>
              <div data-testid="checkout-address-select" style={{ marginBottom: '20px' }}>
                <AddressBook onSelectAddress={handleSelectAddress} selectedAddressId={selectedAddressId} />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" name="firstName" placeholder="Maaz" value={formData.firstName} onChange={handleChange} data-testid="firstName-input" className={errors.firstName ? 'input-error' : ''} />
                  {errors.firstName && <span className="field-error" data-testid="firstName-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" name="lastName" placeholder="Imtiaz" value={formData.lastName} onChange={handleChange} data-testid="lastName-input" className={errors.lastName ? 'input-error' : ''} />
                  {errors.lastName && <span className="field-error" data-testid="lastName-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} data-testid="email-input" className={errors.email ? 'input-error' : ''} />
                  {errors.email && <span className="field-error" data-testid="email-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <PhoneInput
                    country={'pk'}
                    inputProps={{
                      'data-testid': 'phone-input',
                      name: 'phone',
                      id: 'phone'
                    }}
                    value={formData.phone}
                    onChange={(phone, countryData) => {
                      setFormData({ ...formData, phone, country: countryData?.name || formData.country });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    inputStyle={{
                      width: '100%',
                      padding: '10px 14px 10px 48px',
                      background: 'var(--bg-input)',
                      border: errors.phone ? '1px solid var(--error)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      height: '43px',
                    }}
                    buttonStyle={{
                      background: 'var(--bg-input)',
                      border: errors.phone ? '1px solid var(--error)' : '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                      padding: '0 4px',
                    }}
                    dropdownStyle={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {errors.phone && <span className="field-error" data-testid="phone-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input id="address" type="text" name="address" placeholder="123 Street, Area" value={formData.address} onChange={handleChange} data-testid="address-input" className={errors.address ? 'input-error' : ''} />
                {errors.address && <span className="field-error" data-testid="address-error">{errors.address}</span>}
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" name="city" placeholder="Karachi" value={formData.city} onChange={handleChange} data-testid="city-input" className={errors.city ? 'input-error' : ''} />
                  {errors.city && <span className="field-error" data-testid="city-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input id="zipCode" type="text" name="zipCode" placeholder="54000" value={formData.zipCode} onChange={handleChange} data-testid="zipCode-input" className={errors.zipCode ? 'input-error' : ''} />
                  {errors.zipCode && <span className="field-error" data-testid="zipCode-error">{errors.zipCode}</span>}
                </div>
              </div>
            </div>

            <div className="checkout-form-card" style={{ marginTop: '20px' }}>
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '10px' }}>
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Payment Method
              </h2>

              {/* Sandbox Test Mode Banner (Only shown if Safepay selected) */}
              {paymentMethod === 'safepay' && (
                <div
                  className="payment-status-banner"
                  data-testid="payment-status-banner"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid #f59e0b',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#f59e0b',
                    fontWeight: '500',
                    fontSize: '0.88rem'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span><strong>TEST MODE ENABLED:</strong> Safepay Gateway is running strictly in Sandbox mode. No real monetary transactions will occur.</span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <label
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'safepay' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: paymentMethod === 'safepay' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '600'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="safepay"
                    checked={paymentMethod === 'safepay'}
                    onChange={() => setPaymentMethod('safepay')}
                  />
                  <span>Safepay Gateway (Sandbox)</span>
                </label>

                <label
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'cod' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: paymentMethod === 'cod' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '600'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>

              {paymentMethod === 'safepay' ? (
                <div style={{ padding: '16px', background: 'rgba(192, 138, 46, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(192, 138, 46, 0.25)', color: 'var(--color-text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Hosted Checkout via Safepay (Sandbox Mode)
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    You will be redirected to Safepay&apos;s secure Hosted Checkout page to complete your payment using test cards or mobile wallets.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--color-text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Cash on Delivery (COD)
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Pay with cash when your package is delivered to your doorstep. No prepayment required.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-order-summary" data-testid="checkout-order-summary">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '8px' }}>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M9 2h6" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
              Order Summary
            </h3>
            <div className="order-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <img src={item.productId.image} alt={item.productId.name} />
                  <div className="order-item-name">{item.productId.name} <span>×{item.quantity}</span></div>
                  <div className="order-item-price">Rs. {(item.productId.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="coupon-section" style={{ margin: '15px 0', padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Have a Coupon Code?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  data-testid="coupon-input"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  data-testid="coupon-apply-button"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.8rem', color: '#10b981' }}>
                  <span>Code <strong>{appliedCoupon.code}</strong> Applied</span>
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponCode(''); toast.info('Coupon removed'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {appliedCoupon && (
              <div className="summary-row" style={{ color: '#10b981', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span data-testid="coupon-discount-amount">-Rs. {discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-total">Grand Total <span>Rs. {grandTotal}</span></div>
            <button
              type="button"
              className="btn btn-success btn-full"
              disabled={submitting || redirectPending}
              data-testid="payment-checkout-button"
              onClick={handleSubmit}
            >
              {submitting || redirectPending ? 'Processing...' : `Place Order • Rs. ${grandTotal}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
