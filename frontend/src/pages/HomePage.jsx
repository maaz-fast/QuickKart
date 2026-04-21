import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text short" />
  </div>
);

const HomePage = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [addingWishlistId, setAddingWishlistId] = useState(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Fetch unique categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/products/categories?usedOnly=true');
        setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCats();
  }, []);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        let url = `/products?page=${page}&limit=8`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;

        const { data } = await api.get(url);
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search if needed, but for now simple trigger
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice, page]);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    setAddingId(productId);
    const result = await addToCart(productId, 1);
    setAddingId(null);

    if (result.success) {
      setSuccessId(productId);
      toast.success('Added to cart!');
      setTimeout(() => setSuccessId(null), 1500);
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (e, productId) => {
    e.stopPropagation();
    setAddingWishlistId(productId);
    await toggleWishlist(productId);
    setAddingWishlistId(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 data-testid="home-page-title">
          <span className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle' }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span> Explore Products
        </h1>
        <p>Discover our curated collection. {totalCount > 0 && `Showing ${totalCount} items.`}</p>
      </div>

      {/* Advanced Filter Bar */}
      <div className="filter-bar" data-testid="filter-bar">
        <div className="filter-row-top">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="search-input"
              data-testid="search-input"
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => { setSearch(''); setPage(1); }}
                data-testid="search-clear-button"
              >
                ✕
              </button>
            )}
          </div>

          <div className="price-filters">
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              className="price-input"
              data-testid="min-price-filter"
            />
            <span className="price-sep">-</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              className="price-input"
              data-testid="max-price-filter"
            />
            {(minPrice || maxPrice) && (
              <button 
                className="price-clear" 
                onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }}
                title="Clear price filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="category-tabs" data-testid="category-tabs">
          <button
            className={`category-tab ${category === 'All' ? 'active' : ''}`}
            onClick={() => { setCategory('All'); setPage(1); }}
            data-testid="category-tab-all"
          >
            <span>🏠</span> All
          </button>
          {categories.map((cat) => {
            const getIcon = (name) => {
              const n = name.toLowerCase();
              if (n.includes('elect')) return '💻';
              if (n.includes('fash') || n.includes('cloth')) return '👕';
              if (n.includes('home')) return '🏠';
              if (n.includes('sport')) return '⚽';
              if (n.includes('beaut') || n.includes('care')) return '✨';
              if (n.includes('food') || n.includes('grocer')) return '🍎';
              if (n.includes('toy') || n.includes('kid')) return '🧸';
              return '📦';
            };
            return (
              <button
                key={cat._id}
                className={`category-tab ${category === cat._id ? 'active' : ''}`}
                onClick={() => { setCategory(cat._id); setPage(1); }}
                data-testid={`category-tab-${cat.name.toLowerCase()}`}
              >
                <span>{getIcon(cat.name)}</span> {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" data-testid="products-error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Skeleton Loading */}
      {loading && (
        <div className="loading-grid" data-testid="products-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="empty-state" data-testid="products-empty-state">
          <span className="empty-state-icon">🔎</span>
          <h2>No products found</h2>
          <p>Try matching your search or adjusting filters.</p>
          <button
            className="btn btn-outline"
            onClick={clearFilters}
            data-testid="clear-filters-button"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="products-grid" data-testid="products-grid">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="product-card"
                onClick={() => navigate(`/products/${product._id}`)}
                data-testid={`product-card-${product._id}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                role="button"
                tabIndex={0}
              >
                <div className="product-card-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-card-image"
                    data-testid={`product-image-${product._id}`}
                    loading="lazy"
                  />
                </div>

                <div className="product-card-body">
                  <p className="product-card-category">
                    {(() => {
                      const n = (product.category?.name || '').toLowerCase();
                      if (n.includes('elect')) return '💻 ';
                      if (n.includes('fash') || n.includes('cloth')) return '👕 ';
                      if (n.includes('home')) return '🏠 ';
                      if (n.includes('sport')) return '⚽ ';
                      if (n.includes('beaut') || n.includes('care')) return '✨ ';
                      if (n.includes('food') || n.includes('grocer')) return '🍎 ';
                      if (n.includes('toy') || n.includes('kid')) return '🧸 ';
                      return '📦 ';
                    })()}
                    {product.category?.name || 'Uncategorized'}
                  </p>
                  <h3 className="product-card-name" data-testid={`product-name-${product._id}`}>
                    {product.name}
                  </h3>
                  <p className="product-card-desc">{product.description}</p>

                  <div className="product-card-footer">
                    <span className="product-card-price" data-testid={`product-price-${product._id}`}>
                      ${product.price.toFixed(2)}
                    </span>
                    {!isAdmin && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={(e) => handleAddToWishlist(e, product._id)}
                          disabled={addingWishlistId === product._id}
                          data-testid={`add-to-wishlist-${product._id}`}
                          title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          style={{ width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {addingWishlistId === product._id ? (
                            <span className="btn-spinner" style={{ width: '14px', height: '14px', display: 'inline-block', borderWidth: '2px' }} />
                          ) : isInWishlist(product._id) ? (
                            <svg viewBox="0 0 24 24" fill="var(--error)" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          )}
                        </button>
                        <button
                          className={`btn ${successId === product._id ? 'btn-success' : 'btn-primary'} btn-sm`}
                          onClick={(e) => handleAddToCart(e, product._id)}
                          disabled={addingId === product._id}
                          data-testid={`add-to-cart-button-${product._id}`}
                        >
                          {addingId === product._id ? (
                            <span className="btn-spinner" style={{ width: '14px', height: '14px', display: 'inline-block', borderWidth: '2px' }} />
                          ) : successId === product._id ? '✓ Added' : '+ Cart'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination" data-testid="pagination">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              data-testid="prev-page-button"
            >
              ← Previous
            </button>
            <div className="page-indicator">
              Page <span data-testid="current-page">{page}</span> of <span data-testid="total-pages">{totalPages}</span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              data-testid="next-page-button"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
