import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axiosConfig';

const AdminSidebar = ({ isOpen, onClose }) => {
  const [counts, setCounts] = useState({ pendingOrders: 0, pendingSupport: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await api.get('/admin/counts');
        setCounts(data.counts);
      } catch (err) {
        console.error('Failed to fetch sidebar counts');
      }
    };
    fetchCounts();

    // Refresh counts every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">⚡</div>
        <h3>Admin Portal</h3>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-dashboard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-products"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
          Products
        </NavLink>

        <NavLink
          to="/admin/categories"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-categories"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <path d="M4 20h16" />
            <path d="M4 16h16" />
            <path d="M4 12h16" />
            <path d="M4 8h16" />
            <path d="M4 4h16" />
          </svg>
          Categories
        </NavLink>

        <NavLink
          to="/admin/orders"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-orders"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M9 2h6" />
            <circle cx="12" cy="11" r="3" />
            <path d="m9 17 2 2 4-4" />
          </svg>
          Global Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-users"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Users
        </NavLink>

        <NavLink
          to="/admin/support"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-support"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Support
          {counts.pendingSupport > 0 && (
            <span className="sidebar-badge" style={{ marginLeft: 'auto', background: 'var(--warning)', color: '#000', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontSize: '0.7rem' }}>
              {counts.pendingSupport}
            </span>
          )}
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/" className="sidebar-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Store
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
