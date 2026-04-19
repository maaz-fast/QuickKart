const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container" data-testid="pagination-controls">
      <button
        className="btn btn-sm btn-outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        data-testid="pagination-prev"
      >
        ← Prev
      </button>

      <div className="pagination-numbers">
        {pages.map((page) => (
          <button
            key={page}
            className={`pagination-num ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            data-testid={`pagination-page-${page}`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="btn btn-sm btn-outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        data-testid="pagination-next"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
