import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import BrandedLoader from '../components/common/BrandedLoader';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination';
import { useRef } from 'react';

const AdminSupport = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [selectedQuery, setSelectedQuery] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const url = `/admin/support?page=${page}&limit=10${statusFilter !== 'All' ? `&status=${statusFilter}` : ''}`;
      const { data } = await api.get(url);
      setQueries(data.queries);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/support/${id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      setQueries(queries.map(q => q._id === id ? { ...q, status: newStatus } : q));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading && page === 1) return <BrandedLoader fullPage message="Loading Queries..." />;

  return (
    <div className="container admin-support-page" style={{ padding: '40px 0' }}>
      <div className="admin-card-header">
        <div>
          <h1>Customer Support</h1>
          <p>Manage user queries and feedback</p>
        </div>
        <div className="filter-group">
          <div className="custom-select-wrapper" ref={dropdownRef} style={{ width: '180px' }}>
            <div 
              className={`custom-select-header sm ${showStatusDropdown ? 'open' : ''}`}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', transform: showStatusDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            {showStatusDropdown && (
              <div className="custom-select-options">
                {['All', 'Pending', 'Resolved'].map((status) => (
                  <div 
                    key={status}
                    className={`custom-select-option ${statusFilter === status ? 'selected' : ''}`}
                    onClick={() => { 
                      setStatusFilter(status); 
                      setPage(1);
                      setShowStatusDropdown(false); 
                    }}
                  >
                    {status === 'All' ? 'All Status' : status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card admin-mt-4">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>{q.name}</strong>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{q.email}</div>
                    </div>
                  </td>
                  <td><strong style={{ fontSize: '0.9rem' }}>{q.subject}</strong></td>
                  <td style={{ maxWidth: '350px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                      {q.message.length > 120 ? (
                        <>
                          {q.message.substring(0, 120)}...
                          <button 
                            onClick={() => setSelectedQuery(q)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--primary)', 
                              padding: '0 6px', 
                              cursor: 'pointer', 
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              textDecoration: 'underline'
                            }}
                          >
                            View Full
                          </button>
                        </>
                      ) : (
                        q.message
                      )}
                    </p>
                  </td>
                  <td>
                    <span className={`status-badge ${q.status.toLowerCase()}`} style={{ 
                      padding: '4px 10px', 
                      borderRadius: '100px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      backgroundColor: q.status === 'Resolved' ? 'rgba(67, 233, 123, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: q.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {q.status}
                    </span>
                  </td>
                  <td>
                    {q.status === 'Pending' ? (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleStatusChange(q._id, 'Resolved')}
                      >
                        Resolve
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleStatusChange(q._id, 'Pending')}
                      >
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {queries.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No queries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="modal-overlay" onClick={() => setSelectedQuery(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', borderRadius: '20px' }}>
            <div className="modal-header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: '800' }}>Query Details</h3>
              <button 
                onClick={() => setSelectedQuery(null)}
                style={{ background: 'var(--bg-input)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Subject</label>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedQuery.subject}</p>
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '30px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>From</label>
                  <p style={{ margin: 0, fontWeight: '600' }}>{selectedQuery.name}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Email</label>
                  <p style={{ margin: 0, color: 'var(--primary-light)', fontWeight: '600' }}>{selectedQuery.email}</p>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Message Content</label>
                <div style={{ 
                  background: 'var(--bg-input)', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.8',
                  maxHeight: '350px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}>
                  {selectedQuery.message}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setSelectedQuery(null)}
                style={{ padding: '12px 30px', borderRadius: '12px', fontWeight: '700' }}
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

export default AdminSupport;
