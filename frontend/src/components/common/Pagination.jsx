const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxDisplayed = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxDisplayed - 1);

  if (endPage - startPage < maxDisplayed - 1) {
    startPage = Math.max(1, endPage - maxDisplayed + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container" data-testid="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        className="pagination-arrow-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        data-testid="pagination-prev"
        aria-label="Previous page"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.4 : 1,
          fontSize: '0.85rem'
        }}
      >
        ‹
      </button>

      <div className="pagination-numbers" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {pages.map((page) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              className={`pagination-num ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              data-testid={`pagination-page-${page}`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        className="pagination-arrow-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        data-testid="pagination-next"
        aria-label="Next page"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.4 : 1,
          fontSize: '0.85rem'
        }}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
