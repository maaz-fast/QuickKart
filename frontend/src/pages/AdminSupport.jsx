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
    <div className="container admin-support-page">
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
                  <td>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {q.message}
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
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
