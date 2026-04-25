import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
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
          <span style={{ fontSize: '1.4rem' }}>⚡</span> QuickKart
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
        <Link to="/" onClick={closeMenu} data-testid="navbar-home-link" className="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </Link>
        {!isAdmin && (
          <Link to="/contact" onClick={closeMenu} data-testid="navbar-contact-link" className="nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Contact
          </Link>
        )}
        {isAuthenticated ? (
          <>
            {!isAdmin && (
              <Link to="/orders" onClick={closeMenu} data-testid="navbar-orders-link" className="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
                Orders
              </Link>
            )}
            {!isAdmin && (
              <Link to="/wishlist" onClick={closeMenu} data-testid="navbar-wishlist-link" className="nav-link cart-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Wishlist
                {wishlistItems.length > 0 && (
                  <span className="cart-badge" data-testid="wishlist-count-badge">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}
            {!isAdmin && (
              <Link to="/cart" onClick={closeMenu} data-testid="cart-icon" className="nav-link cart-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                Admin Panel
              </Link>
            )}

            <div className="nav-actions">
              <NotificationDropdown />
              <button 
                className="theme-toggle" 
                onClick={() => { toggleTheme(); closeMenu(); }} 
                data-testid="theme-toggle-button"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link to="/profile" onClick={closeMenu} className="nav-user" data-testid="navbar-username">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.2em', height: '1.2em' }}>
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="no-print" style={{ fontSize: '0.85rem' }}>{user?.name.split(' ')[0]}</span>
              </Link>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={() => { toggleTheme(); closeMenu(); }} 
              data-testid="theme-toggle-button"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link to="/login" onClick={closeMenu} data-testid="navbar-login-link" className="nav-link">
              Login
            </Link>
            <Link to="/signup" onClick={closeMenu} data-testid="navbar-signup-link" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
