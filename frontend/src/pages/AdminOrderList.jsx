import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filter, setFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null); // 'filter' or orderId
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Processing': return '#3b82f6';
      case 'Shipped': return '#6366f1';
      case 'Delivered': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/orders?page=${currentPage}&limit=10`);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.totalCount);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      // Update local state without full reload
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    }
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

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) return <BrandedLoader fullPage message="Organizing Orders..." />;

  return (
    <div className="admin-orders-page" data-testid="admin-orders-page">
      <div className="admin-card-header">
        <div>
          <h1>Global Orders</h1>
          <p>Track and fulfill customer orders from all time</p>
        </div>
        <div className="order-filter" ref={activeDropdown === 'filter' ? dropdownRef : null}>
          <div className="custom-select-wrapper">
            <div 
              className={`custom-select-header sm ${activeDropdown === 'filter' ? 'open' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'filter' ? null : 'filter')}
              data-testid="admin-order-filter"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {filter !== 'All' && <span className="status-dot" style={{ background: getStatusColor(filter) }}></span>}
                {filter === 'All' ? 'All Statuses' : filter}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', transform: activeDropdown === 'filter' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            {activeDropdown === 'filter' && (
              <div className="custom-select-options">
                <div 
                  className={`custom-select-option ${filter === 'All' ? 'selected' : ''}`}
                  onClick={() => { setFilter('All'); setActiveDropdown(null); }}
                >
                  All Statuses
                </div>
                {STATUS_OPTIONS.map((status) => (
                  <div 
                    key={status}
                    className={`custom-select-option ${filter === status ? 'selected' : ''}`}
                    onClick={() => { setFilter(status); setActiveDropdown(null); }}
                  >
                    <span className="status-dot" style={{ background: getStatusColor(status) }}></span>
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card admin-mt-4">
        <div className="admin-table-container">
          <table className="admin-table" data-testid="admin-orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} data-testid={`admin-order-row-${order._id}`}>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <code style={{ fontSize: '0.85rem' }}>#{order._id.slice(-8).toUpperCase()}</code>
                  </td>
                  <td>
                    <div>
                      <strong>{order.user?.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user?.email}</div>
                    </div>
                  </td>
                  <td>
                    <strong>${order.totalAmount.toFixed(2)}</strong>
                  </td>
                  <td>
                    <div className="order-status-badge">
                      <span className="status-dot" style={{ background: getStatusColor(order.status) }}></span>
                      <span style={{ color: getStatusColor(order.status) }}>{order.status}</span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="custom-select-wrapper" style={{ width: 'auto' }} ref={activeDropdown === order._id ? dropdownRef : null}>
                        <div 
                          className={`custom-select-header sm ${activeDropdown === order._id ? 'open' : ''} ${order.status === 'Delivered' ? 'disabled' : ''}`}
                          onClick={() => {
                            if (order.status !== 'Delivered') {
                              setActiveDropdown(activeDropdown === order._id ? null : order._id);
                            }
                          }}
                          style={{ 
                            minWidth: '130px', 
                            opacity: order.status === 'Delivered' ? 0.6 : 1, 
                            cursor: order.status === 'Delivered' ? 'not-allowed' : 'pointer',
                            pointerEvents: order.status === 'Delivered' ? 'none' : 'auto'
                          }}
                          data-testid={`status-update-${order._id}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-dot" style={{ background: getStatusColor(order.status) }}></span>
                            {order.status}
                          </div>
                          {order.status !== 'Delivered' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', transform: activeDropdown === order._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                        </div>

                        {activeDropdown === order._id && (
                          <div className="custom-select-options" style={{ left: 0, right: 0 }}>
                            {STATUS_OPTIONS.map((status) => (
                              <div 
                                key={status}
                                className={`custom-select-option ${order.status === status ? 'selected' : ''}`}
                                onClick={() => { handleStatusUpdate(order._id, status); setActiveDropdown(null); }}
                              >
                                <span className="status-dot" style={{ background: getStatusColor(status) }}></span>
                                {status}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate(`/orders/${order._id}`)}
                        data-testid={`view-order-${order._id}`}
                        style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center' }}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No orders found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default AdminOrderList;
