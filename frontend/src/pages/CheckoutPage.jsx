import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

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
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const tax = cartTotal * 0.08;
  const shippingPrice = 0;
  const grandTotal = (cartTotal + tax + shippingPrice).toFixed(2);

  // Redirect if cart is empty
  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format card number with spaces
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16);
      const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
      setFormData({ ...formData, cardNumber: formatted });
      setErrors({ ...errors, cardNumber: '' });
      return;
    }
    // Format expiry MM/YY
    if (name === 'expiry') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      const formatted = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
      setFormData({ ...formData, expiry: formatted });
      setErrors({ ...errors, expiry: '' });
      return;
    }
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) newErrors.cardNumber = 'Enter a valid 16-digit card number';

    // Detailed Expiry Validation
    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Enter expiry as MM/YY';
    } else {
      const [month, year] = formData.expiry.split('/').map(n => parseInt(n));
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // getMonth is 0-indexed
      const currentYear = parseInt(now.getFullYear().toString().slice(-2));

      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month (01-12)';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Expiry date cannot be in the past';
      }
    }

    if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'Enter a valid CVV';
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
      // Map cart items to order items schema
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
        paymentMethod: 'Credit Card',
        totalAmount: Number(grandTotal),
        taxAmount: Number(tax.toFixed(2)),
        shippingPrice: Number(shippingPrice)
      };

      const { data } = await api.post('/orders', orderData);

      setCreatedOrderId(data.order._id);
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      await fetchCart(); // Refresh cart (will be empty)
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
            Order ID: <strong>{createdOrderId}</strong>
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
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} data-testid="checkout-first-name" className={errors.firstName ? 'input-error' : ''} />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} data-testid="checkout-last-name" className={errors.lastName ? 'input-error' : ''} />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} data-testid="checkout-email" className={errors.email ? 'input-error' : ''} />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" name="phone" placeholder="+92 300 1234567" value={formData.phone} onChange={handleChange} data-testid="checkout-phone" className={errors.phone ? 'input-error' : ''} />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input id="address" type="text" name="address" placeholder="123 Street, Area" value={formData.address} onChange={handleChange} data-testid="checkout-address" className={errors.address ? 'input-error' : ''} />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" name="city" placeholder="Lahore" value={formData.city} onChange={handleChange} data-testid="checkout-city" className={errors.city ? 'input-error' : ''} />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input id="zipCode" type="text" name="zipCode" placeholder="54000" value={formData.zipCode} onChange={handleChange} data-testid="checkout-zip" className={errors.zipCode ? 'input-error' : ''} />
                  {errors.zipCode && <span className="field-error">{errors.zipCode}</span>}
                </div>
              </div>
            </div>

            <div className="checkout-form-card" style={{ marginTop: '20px' }}>
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '10px' }}>
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Payment Details
              </h2>
              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name</label>
                <input id="cardName" type="text" name="cardName" placeholder="Muhammad Maaz" value={formData.cardName} onChange={handleChange} data-testid="checkout-card-name" className={errors.cardName ? 'input-error' : ''} />
                {errors.cardName && <span className="field-error">{errors.cardName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input id="cardNumber" type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleChange} data-testid="checkout-card-number" maxLength={19} className={errors.cardNumber ? 'input-error' : ''} />
                {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="expiry">Expiry (MM/YY)</label>
                  <input id="expiry" type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleChange} data-testid="checkout-expiry" maxLength={5} className={errors.expiry ? 'input-error' : ''} />
                  {errors.expiry && <span className="field-error">{errors.expiry}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input id="cvv" type="password" name="cvv" placeholder="123" value={formData.cvv} onChange={handleChange} data-testid="checkout-cvv" maxLength={4} className={errors.cvv ? 'input-error' : ''} />
                  {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                </div>
              </div>
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
                  <div className="order-item-price">${(item.productId.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="summary-total">Grand Total <span>${grandTotal}</span></div>
            <button type="submit" className="btn btn-success btn-full" disabled={submitting} data-testid="place-order-button">
              {submitting ? 'Processing...' : `Place Order • $${grandTotal}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
