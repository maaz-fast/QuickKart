import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductReviews = ({ productId, onRatingUpdated }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [minRatingFilter, setMinRatingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/products/${productId}/reviews?sortBy=${sortBy}&page=${page}&limit=5`;
      if (minRatingFilter) url += `&rating=${minRatingFilter}`;

      const { data } = await api.get(url);
      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy, minRatingFilter, page]);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, fetchReviews]);

  // Check if current user has already left a review
  useEffect(() => {
    if (user && reviews.length > 0) {
      const myReview = reviews.find((r) => r.user?._id === user._id || r.user === user._id);
      if (myReview) {
        setRating(myReview.rating);
        setComment(myReview.comment);
      }
    }
  }, [user, reviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a written review');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating,
        comment,
      });
      toast.success('Review submitted successfully!');
      fetchReviews();
      if (onRatingUpdated) onRatingUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
      if (onRatingUpdated) onRatingUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (starCount) => {
    return [1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        style={{ color: n <= starCount ? '#f59e0b' : 'var(--text-muted)', fontSize: '1.1rem' }}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="product-reviews-section" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Customer Reviews & Ratings</h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Rating Filter Dropdown */}
          <select
            value={minRatingFilter}
            onChange={(e) => { setMinRatingFilter(e.target.value); setPage(1); }}
            className="select-input"
            data-testid="reviews-rating-filter"
          >
            <option value="">All Ratings</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
            <option value="2">2★ & above</option>
            <option value="1">1★ & above</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="select-input"
            data-testid="reviews-sort-select"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="highest">Sort by: Highest Rating</option>
            <option value="lowest">Sort by: Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Form - Visible to Authenticated Regular Users Only (Admin can only view & delete) */}
      {isAuthenticated && user?.role !== 'admin' ? (
        <div className="checkout-form-card" style={{ marginBottom: '30px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Leave or Update Your Review</h4>
          <form onSubmit={handleSubmitReview} data-testid="review-form">
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Your Rating</label>
              <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    data-testid={`review-star-${n}`}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      padding: 0,
                      color: n <= (hoverRating || rating) ? '#f59e0b' : 'var(--text-muted)',
                      transition: 'transform 0.1s',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="reviewComment" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Your Review</label>
              <textarea
                id="reviewComment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                maxLength={1000}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              data-testid="review-submit-button"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '25px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Please log in to submit a review for this product.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => {
            const isOwner = user && (rev.user?._id === user._id || rev.user === user._id || user.role === 'admin');
            return (
              <div
                key={rev._id}
                data-testid="review-item"
                style={{
                  padding: '18px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span style={{ fontWeight: '600' }}>{rev.user?.name || 'Anonymous User'}</span>
                      {rev.isVerifiedPurchase && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ margin: '6px 0' }}>{renderStars(rev.rating)}</div>
                <p style={{ margin: '8px 0 0 0', color: 'var(--text-primary)', lineHeight: '1.5' }}>{rev.comment}</p>

                {isOwner && (
                  <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      data-testid="review-delete-button"
                      onClick={() => handleDeleteReview(rev._id)}
                      style={{ color: 'var(--error)', borderColor: 'var(--error)', fontSize: '0.75rem' }}
                    >
                      Delete Review
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Reviews Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '20px' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
