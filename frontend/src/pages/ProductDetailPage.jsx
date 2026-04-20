import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import BrandedLoader from '../components/common/BrandedLoader';

const ProductDetailPage = () => {
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Product not found.'
            : 'Failed to load product. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product._id, quantity);
    setAdding(false);
    if (result.success) {
      setAdded(true);
      toast.success('Added to cart!');
      setTimeout(() => setAdded(false), 2000);
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    setAddingWishlist(true);
    await toggleWishlist(product._id);
    setAddingWishlist(false);
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product?.stock || 99)));
  };

  // Loading state
  if (loading) return <BrandedLoader fullPage message="Analyzing Product Details..." />;

  // Error state
  if (error) {
    return (
      <div className="container">
        <div className="empty-state" data-testid="product-detail-error">
          <span className="empty-state-icon">😕</span>
          <h2>{error}</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            data-testid="back-to-home-button"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container product-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" data-testid="breadcrumb">
        <button
          className="breadcrumb-link"
          onClick={() => navigate('/')}
          data-testid="breadcrumb-home"
        >
          Home
        </button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      {/* Product Layout */}
      <div className="product-detail-grid">
        {/* Image */}
        <div className="product-detail-image-wrapper">
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-image"
            data-testid="product-detail-image"
          />
        </div>

        {/* Info */}
        <div className="product-detail-info" data-testid="product-detail-info">
          <p className="product-detail-category" data-testid="product-detail-category">
            {product.category?.name || 'Uncategorized'}
          </p>

          <h1 className="product-detail-name" data-testid="product-detail-name">
            {product.name}
          </h1>

          <p className="product-detail-price" data-testid="product-detail-price">
            ${product.price.toFixed(2)}
          </p>

          <p className="product-detail-desc" data-testid="product-detail-description">
            {product.description}
          </p>

          {/* Stock badge */}
          <div className="product-detail-stock" data-testid="product-detail-stock">
            ✅ {product.stock} in stock
          </div>

          {/* Quantity selector */}
          {!isAdmin && (
            <div className="quantity-selector" data-testid="quantity-selector">
              <span className="qty-label">Quantity</span>
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  data-testid="quantity-decrease-button"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-value" data-testid="quantity-display">
                  {quantity}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= product.stock}
                  data-testid="quantity-increase-button"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="product-detail-actions">
            {!isAdmin ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                  className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-lg`}
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  data-testid="add-to-cart-button"
                  style={{ flex: 1 }}
                >
                  {adding ? (
                    <><span className="btn-spinner" style={{ width: '16px', height: '16px', display: 'inline-block', borderWidth: '2px', marginRight: '8px', verticalAlign: 'middle' }} /> Adding...</>
                  ) : added ? (
                    '✓ Added to Cart!'
                  ) : (
                    '🛒 Add to Cart'
                  )}
                </button>

                <button
                  className="btn btn-outline btn-lg"
                  onClick={handleAddToWishlist}
                  disabled={addingWishlist}
                  data-testid="detail-add-to-wishlist"
                  title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  style={{ width: '54px', height: '54px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {addingWishlist ? (
                    <span className="btn-spinner" style={{ width: '16px', height: '16px', display: 'inline-block', borderWidth: '2px' }} />
                  ) : isInWishlist(product._id) ? (
                    <svg viewBox="0 0 24 24" fill="var(--error)" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.4em', height: '1.4em' }}>
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.4em', height: '1.4em' }}>
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin View</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>You are viewing this product as an administrator. Purchase features are disabled for your role.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
