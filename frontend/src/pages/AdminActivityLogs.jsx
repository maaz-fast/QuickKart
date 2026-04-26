import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';

const CustomDropdown = ({ value, onChange, options, icon, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef} style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
        {label}
      </label>
      <div 
        className={`custom-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          height: '52px',
          padding: '0 16px',
          background: 'var(--bg-input)',
          border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : 'none'
        }}
      >
        <span style={{ 
          color: isOpen ? 'var(--primary)' : 'var(--text-muted)', 
          transition: 'color 0.2s',
          display: 'flex',
          transform: 'translateY(1px)'
        }}>
          {icon}
        </span>
        <span style={{ flex: '1', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>
          {selectedOption.label}
        </span>
        <svg 
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
          style={{ 
            color: 'var(--text-muted)', 
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div 
          className="custom-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '0',
            right: '0',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'dropdownIn 0.2s ease-out forwards',
            padding: '8px'
          }}
        >
          {options.map((option) => (
            <div 
              key={option.value}
              className={`custom-dropdown-item ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                color: value === option.value ? 'var(--primary)' : 'var(--text-primary)',
                background: value === option.value ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: value === option.value ? '600' : '400'
              }}
              onMouseOver={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--primary-light)';
                }
              }}
              onMouseOut={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
            >
              {option.label}
              {value === option.value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Filters
  const [role, setRole] = useState('');
  const [action, setAction] = useState('');

  const fetchLogs = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setFiltering(true);
      
      let url = `/admin/activity-logs?page=${currentPage}&limit=10`;
      if (role) url += `&role=${role}`;
      if (action) url += `&action=${action}`;

      const { data } = await api.get(url);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotalLogs(data.totalCount);
      setError('');
    } catch (err) {
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  }, [currentPage, role, action]);

  useEffect(() => {
    fetchLogs(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchLogs(false);
    }
  }, [currentPage, role, action]);

  const clearFilters = () => {
    setRole('');
    setAction('');
    setCurrentPage(1);
  };

  const getActionIcon = (actionType) => {
    const iconProps = { width: "16", height: "16", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
    
    if (actionType.includes('LOGIN') || actionType.includes('SIGNUP')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      );
    }
    if (actionType.includes('ORDER')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    }
    if (actionType.includes('CART')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    }
    if (actionType.includes('PRODUCT')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="m21 8-9-5-9 5v8l9 5 9-5Z" />
          <path d="M12 22V12" />
          <path d="m21 8-9 4-9-4" />
        </svg>
      );
    }
    if (actionType.includes('PROFILE')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    }
    if (actionType.includes('DELETE')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      );
    }
    return (
      <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    );
  };

  const actionOptions = [
    { label: 'All Activities', value: '' },
    { label: 'Authentications', value: 'LOGIN|SIGNUP|LOGOUT' },
    { label: 'Cart Actions', value: 'CART' },
    { label: 'Order Processing', value: 'ORDER' },
    { label: 'Product Catalog', value: 'PRODUCT' },
    { label: 'Account Profile', value: 'PROFILE' },
    { label: 'User Management', value: 'VIEW_USERS' },
    { label: 'General Views', value: 'VIEW' }
  ];

  const roleOptions = [
    { label: 'All Access Levels', value: '' },
    { label: 'User Actions', value: 'user' },
    { label: 'Admin Actions', value: 'admin' }
  ];

  if (loading) return <BrandedLoader fullPage message="Accessing System Logs..." />;

  const cleanDescription = (description) => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return description.replace(emailRegex, '').replace(/:\s*$/, '').trim();
  };

  return (
    <div className="admin-logs-page" data-testid="admin-logs-page">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.03em' }}>Activity Explorer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Tracking <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{totalLogs}</span> critical business events</p>
        </div>
        <button 
          onClick={() => fetchLogs(false)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '16px', padding: '14px 24px', fontWeight: '700', boxShadow: 'var(--shadow-glow)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Sync Logs
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-end' }}>
        <CustomDropdown 
          label="Activity Category"
          placeholder="Filter by action..."
          value={action}
          onChange={(val) => { setAction(val); setCurrentPage(1); }}
          options={actionOptions}
          icon={(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          )}
        />

        <CustomDropdown 
          label="Access Level"
          placeholder="Filter by role..."
          value={role}
          onChange={(val) => { setRole(val); setCurrentPage(1); }}
          options={roleOptions}
          icon={(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        />

        {(role || action) && (
          <button 
            onClick={clearFilters}
            className="btn btn-outline"
            style={{ 
              height: '52px', 
              padding: '0 24px', 
              borderRadius: '14px', 
              color: 'var(--error)', 
              borderColor: 'rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)',
              fontWeight: '700'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mt-4">{error}</div>}

      <div className={`admin-card ${filtering ? 'filtering-active' : ''}`} style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        {filtering && (
          <div style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(var(--bg-rgb), 0.6)', 
            backdropFilter: 'blur(6px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="loader-spinner-sm" style={{ width: '48px', height: '48px' }}></div>
          </div>
        )}
        
        <div className="admin-table-container">
          <table className="admin-table" data-testid="activity-log-table">
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                <th style={{ padding: '20px 24px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>Operator</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>Level</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>Operation</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} data-testid="activity-log-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '24px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transform: 'translateY(1px)' }}>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td style={{ padding: '24px' }} data-testid="activity-log-user">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '14px', 
                          background: log.role === 'admin' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--bg-input)',
                          color: log.role === 'admin' ? '#fff' : 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '800',
                          boxShadow: log.role === 'admin' ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                        }}>
                          {log.userId?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{log.userId?.name || 'System User'}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.userId?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        padding: '6px 14px', 
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        background: log.role === 'admin' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                        color: log.role === 'admin' ? 'var(--primary-light)' : 'var(--text-secondary)',
                        border: '1px solid currentColor'
                      }}>
                        {log.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '24px' }} data-testid="activity-log-action">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          color: 'var(--primary)', 
                          filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.2))',
                          display: 'flex',
                          transform: 'translateY(1px)'
                        }}>
                          {getActionIcon(log.action)}
                        </div>
                        <code style={{ 
                          background: 'var(--bg-input)', 
                          padding: '6px 12px', 
                          borderRadius: '10px', 
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          fontWeight: '800',
                          border: '1px solid var(--border)',
                          letterSpacing: '0.02em'
                        }}>
                          {log.action}
                        </code>
                      </div>
                    </td>
                    <td style={{ padding: '24px', fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '450px' }}>
                      <p style={{ margin: 0, lineHeight: '1.7', fontWeight: '500' }}>
                        {cleanDescription(log.description)}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.3 }}>🔭</div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>No Matching Records</h3>
                    <p style={{ maxWidth: '350px', margin: '0 auto', fontSize: '1rem' }}>We couldn't find any activity logs matching your current filters. Try resetting to see all events.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '24px', background: 'var(--bg-hover)' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-dropdown-trigger:hover {
          background: var(--bg-hover) !important;
          border-color: var(--text-muted) !important;
        }
        .admin-table tr:hover {
          background: rgba(var(--primary-rgb), 0.02);
        }
      `}</style>
    </div>
  );
};

export default AdminActivityLogs;
