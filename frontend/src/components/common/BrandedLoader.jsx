const BrandedLoader = ({ size = 'md', fullPage = false, message = 'QuickKart', testId = 'loading-spinner' }) => {
  return (
    <div className={`branded-loader-container ${size} ${fullPage ? 'full-page' : ''}`} data-testid={testId}>
      <div className="loader-visual">
        <div className="loader-bolt">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
            <path d="m13 2-2 10h3L11 22l2-10h-3l2-10z" />
          </svg>
        </div>
        <div className="loader-ring"></div>
      </div>
      {message && <div className="loader-text">{message}</div>}
    </div>
  );
};

export default BrandedLoader;
