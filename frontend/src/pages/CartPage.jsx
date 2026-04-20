import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import BrandedLoader from '../components/common/BrandedLoader';

const CartPage = () => {
  const { cartItems, cartTotal, cartCount, loading, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (cartItemId, itemName) => {
    const result = await removeFromCart(cartItemId);
    if (result.success) {
      toast.info('Item removed from cart');
    } else {
      toast.error(result.message || 'Failed to remove item');
    }
  };

  // Loading state
  if (loading) return <BrandedLoader fullPage message="Synchronizing Your Cart..." />;

  // Empty cart
  if (!loading && cartItems.length === 0) {
    return (
      <div className="container cart-page">
        <div className="page-header">
          <h1 data-testid="cart-page-title">Your Cart 🛒</h1>
        </div>
        <div className="empty-state" data-testid="empty-cart-state">
          <span className="empty-state-icon">🛍️</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven&apos;t added anything yet!</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            data-testid="continue-shopping-button"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      {/* Header */}
      <div className="page-header">
        <h1 data-testid="cart-page-title">Your Cart 🛒</h1>
        <p>{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-list" data-testid="cart-items-list">
          {cartItems.map((item) => {
            const product = item.productId;
            const subtotal = (product.price * item.quantity).toFixed(2);

            return (
              <div
                key={item._id}
                className="cart-item-card"
                data-testid={`cart-item-${item._id}`}
              >
                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="cart-item-image"
                  data-testid={`cart-item-image-${item._id}`}
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                />

                {/* Product Info */}
                <div className="cart-item-info">
                  <p
                    className="cart-item-name"
                    data-testid={`cart-item-name-${item._id}`}
                    onClick={() => navigate(`/products/${product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </p>
                  <p className="cart-item-price" data-testid={`cart-item-price-${item._id}`}>
                    ${product.price.toFixed(2)} each
                  </p>
                  <p className="cart-item-qty" data-testid={`cart-item-qty-${item._id}`}>
                    Qty: <strong>{item.quantity}</strong>
                  </p>
                </div>

                {/* Subtotal */}
                <div className="cart-item-subtotal" data-testid={`cart-item-subtotal-${item._id}`}>
                  ${subtotal}
                </div>

                {/* Remove Button */}
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemove(item._id)}
                  data-testid={`remove-cart-item-${item._id}`}
                  aria-label={`Remove ${product.name} from cart`}
                  title="Remove item"
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary" data-testid="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({cartCount} items)</span>
            <span data-testid="cart-subtotal">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="shipping-free" data-testid="cart-shipping">FREE</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span data-testid="cart-tax">${(cartTotal * 0.08).toFixed(2)}</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span data-testid="cart-total">
              ${(cartTotal * 1.08).toFixed(2)}
            </span>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate('/checkout')}
            data-testid="checkout-button"
          >
            Proceed to Checkout →
          </button>

          <button
            className="btn btn-outline btn-full"
            onClick={() => navigate('/')}
            data-testid="continue-shopping-button"
            style={{ marginTop: '12px' }}
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
