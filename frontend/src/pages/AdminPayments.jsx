import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';
import ActionMenu from '../components/common/ActionMenu';
import { CreditCard, DollarSign, CheckCircle2, Clock, XCircle, Search, Eye, Loader2, X } from 'lucide-react';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    avgValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null); // 'status' or 'method'
  
  const [selectedPayment, setSelectedPayment] = useState(null); // Modal details
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = `/admin/payments?page=${currentPage}&limit=10`;
      if (statusFilter !== 'All') url += `&status=${statusFilter}`;
      if (methodFilter !== 'All') url += `&method=${encodeURIComponent(methodFilter)}`;
      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;

      const { data } = await api.get(url);
      setPayments(data.payments || []);
      setStats(data.stats || {});
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError('Failed to load payment transactions');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Debounced auto-search & filter change handler
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, statusFilter, methodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (order) => {
    if (order.paymentStatus === 'paid' || (order.isPaid && order.paymentStatus !== 'pending')) {
      return (
        <span className="order-status-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} /> Paid
        </span>
      );
    }
    if (order.paymentStatus === 'failed') {
      return (
        <span className="order-status-badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <XCircle size={14} /> Failed
        </span>
      );
    }
    return (
      <span className="order-status-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={14} /> Pending
      </span>
    );
  };

  if (initialLoading && payments.length === 0) return <BrandedLoader fullPage message="Loading Payment Data..." />;

  return (
    <div className="admin-payments-page" data-testid="admin-payments-page" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="admin-card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <CreditCard size={28} color="var(--primary-light)" /> Payment Transactions
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
            Monitor revenue volume, payment status, and transaction history
          </p>
        </div>
      </div>

      {/* KPI Cards Grid - Matching AdminDashboard KPI Style */}
      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Total Revenue Paid Card */}
        <div className="stat-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Revenue Paid</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(176, 141, 87, 0.12)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Rs. {(stats.totalVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{stats.paidCount || 0} completed payments</span>
          </div>
        </div>

        {/* Successful Payments Card */}
        <div className="stat-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Successful Payments</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(63, 125, 92, 0.12)', color: 'var(--color-success, #3F7D5C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {stats.paidCount || 0}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Verified paid orders</span>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="stat-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Payments</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(192, 138, 46, 0.12)', color: 'var(--color-warning, #C08A2E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {stats.pendingCount || 0}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Awaiting processing</span>
          </div>
        </div>

        {/* Avg. Order Value Card */}
        <div className="stat-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg. Order Value</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(107, 104, 98, 0.12)', color: 'var(--color-text-secondary, #6B6862)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: '800', fontSize: '1.85rem', color: 'var(--color-text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Rs. {(stats.avgValue || 0).toFixed(2)}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Per successful checkout</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '20px', position: 'relative', zIndex: 20, overflow: 'visible', border: '1px solid var(--color-border)', borderRadius: '16px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by Customer, Email, Order ID, Method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '38px', paddingRight: '38px', width: '100%', height: '42px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg, #ffffff)', color: 'var(--color-text-primary)' }}
                data-testid="payment-search-input"
              />
              {loading ? (
                <Loader2
                  size={18}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-accent)',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : searchTerm ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                  }}
                  title="Clear search and revert data"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 18px', borderRadius: '8px', background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: '#ffffff', fontWeight: 600 }}>
              Search
            </button>
          </form>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Status Dropdown */}
            <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={activeDropdown === 'status' ? dropdownRef : null}>
              <div 
                className={`custom-select-header sm ${activeDropdown === 'status' ? 'open' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                style={{ minWidth: '140px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg, #ffffff)' }}
                data-testid="payment-status-filter"
              >
                <span>{statusFilter === 'All' ? 'All Statuses' : statusFilter}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              {activeDropdown === 'status' && (
                <div 
                  className="custom-select-options"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: 'var(--color-surface, #ffffff)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    padding: '4px',
                  }}
                >
                  {['All', 'paid', 'pending', 'failed'].map((st) => (
                    <div
                      key={st}
                      className={`custom-select-option ${statusFilter === st ? 'selected' : ''}`}
                      onClick={() => { setStatusFilter(st); setActiveDropdown(null); setCurrentPage(1); }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      {st === 'All' ? 'All Statuses' : st.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Method Dropdown */}
            <div className="custom-select-wrapper" style={{ position: 'relative' }} ref={activeDropdown === 'method' ? dropdownRef : null}>
              <div 
                className={`custom-select-header sm ${activeDropdown === 'method' ? 'open' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'method' ? null : 'method')}
                style={{ minWidth: '160px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg, #ffffff)' }}
                data-testid="payment-method-filter"
              >
                <span>{methodFilter === 'All' ? 'All Methods' : methodFilter}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              {activeDropdown === 'method' && (
                <div 
                  className="custom-select-options"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: 'var(--color-surface, #ffffff)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    padding: '4px',
                  }}
                >
                  {['All', 'Safepay (Sandbox)', 'Cash on Delivery'].map((m) => (
                    <div
                      key={m}
                      className={`custom-select-option ${methodFilter === m ? 'selected' : ''}`}
                      onClick={() => { setMethodFilter(m); setActiveDropdown(null); setCurrentPage(1); }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ position: 'relative', zIndex: 1, border: '1px solid var(--color-border)', borderRadius: '16px', background: 'var(--color-surface)', overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table" data-testid="admin-payments-table">
            <thead>
              <tr style={{ background: 'var(--color-bg, rgba(0,0,0,0.02))', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>DATE</th>
                <th style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>ORDER ID</th>
                <th style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>CUSTOMER</th>
                <th style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>PAYMENT METHOD</th>
                <th style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>AMOUNT</th>
                <th style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>PAYMENT STATUS</th>
                <th style={{ textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
                      <span>Searching payment transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CreditCard size={36} style={{ color: 'var(--color-text-muted)', strokeWidth: 1.5 }} />
                      <h3 style={{ margin: '8px 0 2px 0', fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        No payment transactions found
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '380px' }}>
                        Transactions will appear here once customers complete checkout.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const formattedId = `ORD-${p._id.slice(-8).toUpperCase()}`;
                  return (
                    <tr key={p._id} data-testid={`payment-row-${p._id}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <code style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>{formattedId}</code>
                      </td>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{p.user?.name || 'Customer'}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{p.user?.email}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.paymentMethod || 'Online'}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: p.isPaid ? 'var(--color-success, #3F7D5C)' : 'var(--color-text-primary)' }}>
                          Rs. {p.totalAmount ? p.totalAmount.toFixed(2) : '0.00'}
                        </strong>
                      </td>
                      <td>{getStatusBadge(p)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setSelectedPayment(p)}
                            style={{ gap: '6px', height: '36px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <Eye size={14} /> Details
                          </button>
                          <ActionMenu
                            testId={`payment-action-${p._id}`}
                            items={[
                              {
                                label: 'Payment Details',
                                icon: <Eye size={15} />,
                                onClick: () => setSelectedPayment(p),
                              },
                              {
                                label: 'View Full Order',
                                icon: <CreditCard size={15} />,
                                onClick: () => navigate(`/orders/${p._id}`),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '20px' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedPayment(null)}
        >
          <div 
            className="admin-card" 
            style={{ maxWidth: '520px', width: '100%', padding: '28px', borderRadius: '16px', margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={22} color="var(--primary-light)" /> Payment Details
              </h2>
              <button 
                onClick={() => setSelectedPayment(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                <strong>ORD-{selectedPayment._id.slice(-8).toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer:</span>
                <span>{selectedPayment.user?.name} ({selectedPayment.user?.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                {getStatusBadge(selectedPayment)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span>{selectedPayment.paymentMethod || 'Online'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>Rs. {selectedPayment.totalAmount ? selectedPayment.totalAmount.toFixed(2) : '0.00'}</strong>
              </div>
              {selectedPayment.safepayToken && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Safepay Token:</span>
                  <code style={{ fontSize: '0.8rem', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px' }}>{selectedPayment.safepayToken}</code>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date & Time:</span>
                <span>{new Date(selectedPayment.paidAt || selectedPayment.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const pId = selectedPayment._id;
                  setSelectedPayment(null);
                  navigate(`/orders/${pId}`);
                }}
              >
                Open Full Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
