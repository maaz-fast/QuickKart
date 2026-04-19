import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu} data-testid="navbar-logo">
          ⚡ QuickKart
        </Link>
      </div>

      <button 
        className={`hamburger ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <button 
          className="theme-toggle" 
          onClick={() => { toggleTheme(); closeMenu(); }} 
          data-testid="theme-toggle-button"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {isAuthenticated ? (
          <>
            <Link to="/" onClick={closeMenu} data-testid="navbar-home-link" className="nav-link">
              Home
            </Link>
            {!isAdmin && (
              <Link to="/orders" onClick={closeMenu} data-testid="navbar-orders-link" className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
                My Orders
              </Link>
            )}
            {!isAdmin && (
              <Link to="/cart" onClick={closeMenu} data-testid="cart-icon" className="nav-link cart-link">
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
            )}

            {isAdmin && (
              <Link to="/admin/dashboard" onClick={closeMenu} data-testid="navbar-admin-link" className="nav-link admin-nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                Admin Panel
              </Link>
            )}

            <span className="nav-user" data-testid="navbar-username">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '6px' }}>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user?.name}
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
            <Link to="/login" onClick={closeMenu} data-testid="navbar-login-link" className="nav-link">
              Login
            </Link>
            <Link to="/signup" onClick={closeMenu} data-testid="navbar-signup-link" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
