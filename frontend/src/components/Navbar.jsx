import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" data-testid="navbar-logo">
          ⚡ QuickKart
        </Link>
      </div>
      <div className="navbar-links">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          data-testid="theme-toggle-button"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {isAuthenticated ? (
          <>
            <Link to="/" data-testid="navbar-home-link" className="nav-link">
              Home
            </Link>
            <Link to="/orders" data-testid="navbar-orders-link" className="nav-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }}>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              My Orders
            </Link>
            <Link to="/cart" data-testid="cart-icon" className="nav-link cart-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="cart-badge" data-testid="cart-count-badge">
                  {cartCount}
                </span>
              )}
            </Link>
            <span className="nav-user" data-testid="navbar-username">
              👤 {user?.name}
            </span>
            <button
              className="btn btn-outline"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" data-testid="navbar-login-link" className="nav-link">
              Login
            </Link>
            <Link to="/signup" data-testid="navbar-signup-link" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
