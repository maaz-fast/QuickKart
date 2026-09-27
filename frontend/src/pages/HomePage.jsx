import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import useDebounce from '../hooks/useDebounce';

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="skeleton-card" data-testid="loading-spinner">
    <div className="skeleton skeleton-img" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text short" />
  </div>
);

const HomePage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL params
  const [search, setSearch] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [addingWishlistId, setAddingWishlistId] = useState(null);

  // Debounced values
  const debouncedSearch = useDebounce(search, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const getCategoryIcon = (name, size = "1.2em", color = "currentColor") => {
    const n = name.toLowerCase();
    const props = { 
      width: size, 
      height: size, 
      viewBox: "0 0 24 24", 
      fill: "none", 
      stroke: color, 
      strokeWidth: "2", 
      strokeLinecap: "round", 
      strokeLinejoin: "round",
      style: { verticalAlign: 'middle' }
    };

    if (n === 'all') return <svg {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    if (n.includes('elect')) return <svg {...props}><rect width="20" height="14" x="2" y="3" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    if (n.includes('fash') || n.includes('cloth')) return <svg {...props}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;
    if (n.includes('home')) return <svg {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    if (n.includes('sport')) return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
    if (n.includes('beaut') || n.includes('care')) return <svg {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
    return <svg {...props}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
  };

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

  // Update URL parameters whenever debounced search or filters change
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (category !== 'All') params.category = category;
    if (debouncedMinPrice) params.minPrice = debouncedMinPrice;
    if (debouncedMaxPrice) params.maxPrice = debouncedMaxPrice;
    if (minRating) params.minRating = minRating;
    if (sortBy !== 'newest') params.sortBy = sortBy;
    if (page > 1) params.page = page;

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, category, debouncedMinPrice, debouncedMaxPrice, minRating, sortBy, page, setSearchParams]);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        let url = `/products?page=${page}&limit=8`;
        if (debouncedSearch) url += `&q=${encodeURIComponent(debouncedSearch)}`;
        if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
        if (debouncedMinPrice) url += `&minPrice=${debouncedMinPrice}`;
        if (debouncedMaxPrice) url += `&maxPrice=${debouncedMaxPrice}`;
        if (minRating) url += `&minRating=${minRating}`;
        if (sortBy) url += `&sortBy=${sortBy}`;

        const { data } = await api.get(url);
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.products.length);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, category, debouncedMinPrice, debouncedMaxPrice, minRating, sortBy, page]);

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
    setMinRating('');
    setSortBy('newest');
    setPage(1);
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} style={{ color: '#f59e0b' }}>★</span>);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<span key={i} style={{ color: '#f59e0b' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: 'var(--text-muted)' }}>☆</span>);
      }
    }
    return stars;
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
      <div className="filter-bar" data-testid="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="filter-row-top" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="search-wrapper" style={{ flex: '1 1 240px' }}>
            <span className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
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

          {/* Min & Max Price */}
          <div className="price-filters" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              placeholder="Min PKR"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              className="price-input"
              data-testid="filter-price-min"
            />
            <span className="price-sep">-</span>
            <input
              type="number"
              placeholder="Max PKR"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              className="price-input"
              data-testid="filter-price-max"
            />
          </div>

          {/* Rating Filter Selector */}
          <div className="rating-filter-wrapper">
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="select-input"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.9rem',
              }}
            >
              <option value="">All Ratings</option>
              <option value="4" data-testid="filter-rating-4">4★ & above</option>
              <option value="3" data-testid="filter-rating-3">3★ & above</option>
              <option value="2" data-testid="filter-rating-2">2★ & above</option>
              <option value="1" data-testid="filter-rating-1">1★ & above</option>
            </select>
          </div>

          {/* Sort Selector Dropdown */}
          <div className="sort-wrapper">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="select-input"
              data-testid="sort-select"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.9rem',
              }}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(search || category !== 'All' || minPrice || maxPrice || minRating || sortBy !== 'newest') && (
            <button
              className="btn btn-outline btn-sm"
              onClick={clearFilters}
              data-testid="clear-filters-button"
              style={{ fontSize: '0.85rem' }}
            >
              Clear Filters ✕
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="category-tabs" data-testid="category-tabs">
          <button
            className={`category-tab ${category === 'All' ? 'active' : ''}`}
            onClick={() => { setCategory('All'); setPage(1); }}
            data-testid="filter-category-all"
          >
            <span className="tab-icon">{getCategoryIcon('all')}</span> All
          </button>
          {categories.map((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catId = typeof cat === 'string' ? cat : cat._id;
            const slug = catName.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={catId}
                className={`category-tab ${category === catId ? 'active' : ''}`}
                onClick={() => { setCategory(catId); setPage(1); }}
                data-testid={`filter-category-${slug}`}
              >
                <span className="tab-icon">{getCategoryIcon(catName)}</span> {catName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" data-testid="products-error-message">
          {error}
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
        <div className="empty-state" data-testid="products-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <span className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
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
          <div className="products-grid" data-testid="products-grid" data-loading={loading ? "true" : "false"}>
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
                  {product.stock === 0 && (
                    <div className="out-of-stock-badge">Out of Stock</div>
                  )}
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
                    <span style={{ marginRight: '6px', opacity: 0.7 }}>
                      {getCategoryIcon(product.category?.name || '', '1em')}
                    </span>
                    {product.category?.name || 'Uncategorized'}
                  </p>
                  <h3 className="product-card-name" data-testid={`product-name-${product._id}`}>
                    {product.name}
                  </h3>

                  {/* Rating Stars Badge */}
                  <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0', fontSize: '0.85rem' }}>
                    {renderStars(product.averageRating || 0)}
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
                      ({product.numReviews || 0})
                    </span>
                  </div>

                  <p className="product-card-desc">{product.description}</p>

                  <div className="product-card-footer">
                    <span className="product-card-price" data-testid={`product-price-${product._id}`}>
                      Rs. {product.price.toFixed(2)}
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
                          disabled={addingId === product._id || product.stock === 0}
                          data-testid={`add-to-cart-button-${product._id}`}
                        >
                          {addingId === product._id ? (
                            <span className="btn-spinner" style={{ width: '14px', height: '14px', display: 'inline-block', borderWidth: '2px' }} />
                          ) : successId === product._id ? (
                            '✓ Added'
                          ) : product.stock === 0 ? (
                            'Sold Out'
                          ) : (
                            '+ Cart'
                          )}
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
