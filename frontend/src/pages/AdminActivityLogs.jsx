import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';
import ActionMenu, { EyeIcon, TrashIcon } from '../components/common/ActionMenu';
import { toast } from 'react-toastify';

const CustomDropdown = ({ value, onChange, options, icon, label }) => {
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
    <div className="custom-select-wrapper" ref={dropdownRef} style={{ width: '220px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div 
        className={`custom-select-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          height: '42px', 
          minHeight: '42px', 
          borderRadius: '12px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
          <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{selectedOption.label}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div className="custom-select-options" style={{ 
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--color-surface)',
          borderRadius: '12px', 
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          {options.map((option) => (
            <div 
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{ 
                padding: '10px 14px', 
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: value === option.value ? 'var(--bg-hover)' : 'transparent',
                fontWeight: value === option.value ? '600' : '500',
                color: 'var(--color-text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{option.label}</span>
                {value === option.value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
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
  const [selectedLog, setSelectedLog] = useState(null);

  const handleDeleteLog = (logId) => {
    setLogs(prev => prev.filter(l => l._id !== logId));
    setTotalLogs(prev => Math.max(0, prev - 1));
    toast.success('Activity log entry removed');
  };

  const fetchLogs = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setFiltering(true);
      
      let url = `/admin/activity-logs?page=${currentPage}&limit=8`;
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
    const iconProps = { width: "14", height: "14", stroke: "currentColor", strokeWidth: "2", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
    
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
    if (actionType.includes('PRODUCT') || actionType.includes('CSV')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="m21 8-9-5-9 5v8l9 5 9-5Z" />
          <path d="M12 22V12" />
          <path d="m21 8-9 4-9-4" />
        </svg>
      );
    }
    if (actionType.includes('COUPON')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z"/>
          <path d="M9 9h.01"/>
          <path d="M15 15h.01"/>
        </svg>
      );
    }
    if (actionType.includes('TICKET') || actionType.includes('SUPPORT')) {
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    }
    return (
      <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
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
    if (!description) return '';
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    let cleaned = description.replace(emailRegex, '').replace(/:\s*$/, '').trim();
    return cleaned.replace(/\b([a-fA-F0-9]{24})\b/g, (match) => 'ORD-' + match.slice(-8).toUpperCase());
  };

  const getAvatarBg = (name, role) => {
    if (role === 'admin' || name?.toLowerCase().includes('admin')) return '#A37B3E';
    if (role === 'support' || name?.toLowerCase().includes('support')) return '#A0B296';
    if (name?.toLowerCase().includes('test')) return '#78909C';
    return '#5C6B73';
  };

  const getLevelBadgeStyle = (userRole) => {
    const roleLower = (userRole || '').toLowerCase();
    if (roleLower === 'admin') {
      return { background: 'rgba(163, 123, 62, 0.14)', color: '#8F6B30' };
    }
    if (roleLower === 'support') {
      return { background: 'rgba(76, 175, 80, 0.14)', color: '#2E7D32' };
    }
    return { background: 'rgba(148, 163, 184, 0.15)', color: '#64748B' };
  };

  const startLogNum = (currentPage - 1) * 8 + 1;
  const endLogNum = Math.min(currentPage * 8, totalLogs);

  return (
    <div className="admin-logs-page" data-testid="admin-logs-page">
      {/* Top Filter Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
        <CustomDropdown 
          label="Activity Category"
          value={action}
          onChange={(val) => { setAction(val); setCurrentPage(1); }}
          options={actionOptions}
          icon={(
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          )}
        />

        <CustomDropdown 
          label="Access Level"
          value={role}
          onChange={(val) => { setRole(val); setCurrentPage(1); }}
          options={roleOptions}
          icon={(
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              height: '42px', 
              padding: '0 16px', 
              borderRadius: '12px', 
              color: 'var(--color-error)', 
              borderColor: 'rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* Main Sleek Log Table Card */}
      <div 
        className={`admin-card ${filtering ? 'filtering-active' : ''}`} 
        style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          borderRadius: '16px', 
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', 
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' 
        }}
      >
        {filtering && (
          <div style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(255, 255, 255, 0.5)', 
            backdropFilter: 'blur(4px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
          </div>
        )}
        
        <div className="admin-table-container">
          <table className="admin-table" data-testid="activity-log-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Operator</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Level</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Operation</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>Details</th>
                <th style={{ padding: '14px 20px', width: '48px' }}></th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => {
                  const userName = log.userId?.name || 'System User';
                  const userEmail = log.userId?.email || 'N/A';
                  const userAvatar = log.userId?.profileImage || log.userId?.avatar;
                  const firstChar = userName.charAt(0).toUpperCase();
                  const avatarBg = getAvatarBg(userName, log.role);
                  const levelStyle = getLevelBadgeStyle(log.role);

                  return (
                    <tr key={log._id} data-testid="activity-log-row" style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 150ms ease' }}>
                      {/* Timestamp */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </td>

                      {/* Operator */}
                      <td style={{ padding: '16px 20px' }} data-testid="activity-log-user">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {userAvatar ? (
                            <img 
                              src={userAvatar} 
                              alt={userName} 
                              style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '1px solid var(--color-border)'
                              }} 
                            />
                          ) : (
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              background: avatarBg,
                              color: '#FFFFFF',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '0.9rem', 
                              fontWeight: '700',
                              flexShrink: 0
                            }}>
                              {firstChar}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', fontWeight: '700' }}>{userName}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          padding: '4px 10px', 
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          letterSpacing: '0.04em',
                          background: levelStyle.background,
                          color: levelStyle.color,
                          textTransform: 'uppercase'
                        }}>
                          {log.role.toUpperCase()}
                        </span>
                      </td>

                      {/* Operation */}
                      <td style={{ padding: '16px 20px' }} data-testid="activity-log-action">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-hover)', border: '1px solid var(--color-border)', padding: '5px 10px', borderRadius: '8px' }}>
                          <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                            {getActionIcon(log.action)}
                          </span>
                          <span style={{ 
                            fontSize: '0.78rem',
                            color: 'var(--color-text-primary)',
                            fontWeight: '700',
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em'
                          }}>
                            {log.action}
                          </span>
                        </div>
                      </td>

                      {/* Details */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                        {cleanDescription(log.description)}
                      </td>

                      {/* Actions column (three dots) */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <ActionMenu
                          items={[
                            {
                              label: 'View Details',
                              icon: <EyeIcon />,
                              onClick: () => setSelectedLog(log),
                              testId: `view-log-${log._id}`
                            },
                            {
                              label: 'Delete Log',
                              icon: <TrashIcon />,
                              isDelete: true,
                              onClick: () => handleDeleteLog(log._id),
                              testId: `delete-log-${log._id}`
                            }
                          ]}
                          testId={`log-actions-${log._id}`}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text-primary)' }}>No Matching Logs</h3>
                    <p style={{ fontSize: '0.9rem' }}>Try clearing filters to see all activity events.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Sleek Pagination Footer */}
        {totalLogs > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 20px', 
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
              Showing {startLogNum} – {endLogNum} of {totalLogs} logs
            </span>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Activity Event Details</h3>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Timestamp</span>
                <p style={{ margin: '2px 0 0', fontWeight: '600' }}>{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Operator</span>
                <p style={{ margin: '2px 0 0', fontWeight: '600' }}>{selectedLog.userId?.name || 'System'} ({selectedLog.userId?.email || 'N/A'})</p>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Access Level & Action</span>
                <p style={{ margin: '2px 0 0', fontWeight: '600' }}>
                  <span style={{ background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', marginRight: '8px' }}>
                    {selectedLog.role.toUpperCase()}
                  </span>
                  <code>{selectedLog.action}</code>
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Description</span>
                <p style={{ margin: '2px 0 0', lineHeight: '1.6', background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  {cleanDescription(selectedLog.description)}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 20px', borderRadius: '10px', fontWeight: '700' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
