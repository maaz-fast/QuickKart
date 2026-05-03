import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import BrandedLoader from '../components/common/BrandedLoader';

const WishlistPage = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (id) => {
    const result = await removeFromWishlist(id);
    if (result.success) {
      toast.info('Removed from wishlist');
    } else {
      toast.error(result.message || 'Failed to remove item');
    }
  };

  const handleMoveToCart = async (item) => {
    const result = await addToCart(item.product._id, 1);
    if (result.success) {
      toast.success('Added to cart!');
      await handleRemove(item._id); // Remove from wishlist after moving to cart
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  if (loading) return <BrandedLoader fullPage message="Loading your wishlist..." testId="page-loader" />;

  if (wishlistItems.length === 0) {
    return (
      <div className="container cart-page">
        <div className="page-header">
          <h1 data-testid="wishlist-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Your Wishlist 
            <svg viewBox="0 0 24 24" fill="var(--error)" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.8em', height: '0.8em' }}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </h1>
        </div>
        <div className="empty-state" data-testid="empty-wishlist-state">
          <span className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', opacity: 0.3 }}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </span>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love here to buy them later!</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            data-testid="wishlist-continue-shopping"
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="page-header">
        <h1 data-testid="wishlist-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          Your Wishlist 
          <svg viewBox="0 0 24 24" fill="var(--error)" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.8em', height: '0.8em' }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </h1>
        <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
      </div>

      <div className="cart-layout" style={{ display: 'block' }}>
        <div className="cart-items-list" data-testid="wishlist-items-list">
          {wishlistItems.map((item) => {
            const product = item.product;

            return (
              <div
                key={item._id}
                className="cart-item-card"
                data-testid={`wishlist-item-${item._id}`}
                style={{ gridTemplateColumns: '80px 1fr auto auto' }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="cart-item-image"
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                />

                <div className="cart-item-info">
                  <p
                    className="cart-item-name"
                    onClick={() => navigate(`/products/${product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </p>
                  <p className="cart-item-price">${product.price.toFixed(2)}</p>
                  <p style={{ fontSize: '0.8rem', color: product.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleMoveToCart(item)}
                    disabled={product.stock === 0}
                    data-testid={`wishlist-move-cart-${item._id}`}
                  >
                    Move to Cart
                  </button>
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(item._id)}
                    data-testid={`wishlist-remove-${item._id}`}
                    title="Remove from wishlist"
                    style={{ position: 'static', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
