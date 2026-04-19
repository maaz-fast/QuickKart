import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile Header (Visible < 992px) */}
      <div className="admin-mobile-header">
        <button 
          className="admin-toggle-btn"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '10px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span style={{ fontWeight: '700', color: 'var(--primary-light)' }}>QuickKart Admin</span>
      </div>

      <AdminSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      
      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1500 }}
        />
      )}

      <main className="admin-main-content">
        <div className="admin-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
