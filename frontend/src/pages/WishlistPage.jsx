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

  if (loading) return <BrandedLoader fullPage message="Loading your wishlist..." />;

  if (wishlistItems.length === 0) {
    return (
      <div className="container cart-page">
        <div className="page-header">
          <h1 data-testid="wishlist-page-title">Your Wishlist ❤️</h1>
        </div>
        <div className="empty-state" data-testid="empty-wishlist-state">
          <span className="empty-state-icon">🤍</span>
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
        <h1 data-testid="wishlist-page-title">Your Wishlist ❤️</h1>
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
                    style={{ position: 'static' }}
                  >
                    🗑
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
