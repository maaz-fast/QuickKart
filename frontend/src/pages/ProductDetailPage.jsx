import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product?.stock || 99)));
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container product-detail-page">
        <div className="product-detail-grid">
          <div className="skeleton" style={{ height: '420px', borderRadius: '20px' }} />
          <div>
            <div className="skeleton skeleton-text" style={{ height: '20px', width: '40%', marginBottom: '16px' }} />
            <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '12px' }} />
            <div className="skeleton skeleton-text" style={{ height: '40px', width: '50%', marginBottom: '20px' }} />
            <div className="skeleton skeleton-text" style={{ height: '90px', marginBottom: '24px' }} />
            <div className="skeleton skeleton-text" style={{ height: '52px', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

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
            {product.category}
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

          {/* Action Buttons */}
          <div className="product-detail-actions">
            <button
              className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-lg`}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              data-testid="add-to-cart-button"
            >
              {adding
                ? '⏳ Adding...'
                : added
                ? '✓ Added to Cart!'
                : '🛒 Add to Cart'}
            </button>

            <button
              className="btn btn-outline"
              onClick={() => navigate('/cart')}
              data-testid="view-cart-button"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
