import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  LayoutDashboard,
  Package,
  Layers,
  Ticket,
  ClipboardList,
  CreditCard,
  Users,
  LifeBuoy,
  Activity,
  ShieldCheck,
  ArrowLeft,
  Zap
} from 'lucide-react';

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

    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header-box" style={{ padding: '16px 14px 12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          borderRadius: '12px',
          background: 'rgba(176, 141, 87, 0.12)',
          border: '1px solid rgba(176, 141, 87, 0.2)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--color-accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: '800',
            letterSpacing: '0.08em',
            color: 'var(--color-text-primary)',
            textTransform: 'uppercase'
          }}>
            ADMIN PORTAL
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-dashboard"
        >
          <LayoutDashboard size={20} strokeWidth={2} className="sidebar-icon" />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-products"
        >
          <Package size={20} strokeWidth={2} className="sidebar-icon" />
          Products
        </NavLink>

        <NavLink
          to="/admin/categories"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-categories"
        >
          <Layers size={20} strokeWidth={2} className="sidebar-icon" />
          Categories
        </NavLink>

        <NavLink
          to="/admin/coupons"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-coupons"
        >
          <Ticket size={20} strokeWidth={2} className="sidebar-icon" />
          Coupons
        </NavLink>

        <NavLink
          to="/admin/orders"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-orders"
        >
          <ClipboardList size={20} strokeWidth={2} className="sidebar-icon" />
          Global Orders
        </NavLink>

        <NavLink
          to="/admin/payments"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-payments"
        >
          <CreditCard size={20} strokeWidth={2} className="sidebar-icon" />
          Payments
        </NavLink>

        <NavLink
          to="/admin/users"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-users"
        >
          <Users size={20} strokeWidth={2} className="sidebar-icon" />
          Users
        </NavLink>

        <NavLink
          to="/admin/support"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-support"
        >
          <LifeBuoy size={20} strokeWidth={2} className="sidebar-icon" />
          Support
          {counts.pendingSupport > 0 && (
            <span className="sidebar-badge" style={{ marginLeft: 'auto', background: 'var(--color-warning)', color: '#000', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontSize: '0.7rem' }}>
              {counts.pendingSupport}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/activity-logs"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-activity-logs"
        >
          <Activity size={20} strokeWidth={2} className="sidebar-icon" />
          Activity Logs
        </NavLink>

        <NavLink
          to="/admin/swagger-settings"
          onClick={onClose}
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          data-testid="admin-nav-swagger-settings"
        >
          <ShieldCheck size={20} strokeWidth={2} className="sidebar-icon" />
          API Docs Security
        </NavLink>
      </nav>

      <div className="sidebar-footer" style={{ padding: '16px 12px', borderTop: '1px solid var(--color-border)' }}>
        <NavLink to="/" className="sidebar-link">
          <ArrowLeft size={20} strokeWidth={2} className="sidebar-icon" />
          Back to Store
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
