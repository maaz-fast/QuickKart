const BrandedLoader = ({ size = 'md', fullPage = false, message = 'QuickKart' }) => {
  return (
    <div className={`branded-loader-container ${size} ${fullPage ? 'full-page' : ''}`} data-testid="branded-loader">
      <div className="loader-visual">
        <div className="loader-bolt">⚡</div>
        <div className="loader-ring"></div>
      </div>
      {message && <div className="loader-text">{message}</div>}
    </div>
  );
};

export default BrandedLoader;
