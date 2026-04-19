import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/users?page=${currentPage}&limit=10`);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalCount);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  if (loading) return <BrandedLoader fullPage message="Loading User Directory..." />;

  return (
    <div className="admin-users-page" data-testid="admin-users-page">
      <div className="admin-card-header">
        <div>
          <h1>Registered Users</h1>
          <p>Total users managed: {totalUsers}</p>
        </div>
      </div>

      <div className="admin-card mt-4">
        <div className="admin-table-container">
          <table className="admin-table" data-testid="admin-users-table">
            <thead>
              <tr>
                <th>Join Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} data-testid={`admin-user-row-${user._id}`}>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-outline'}`} style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      background: user.role === 'admin' ? 'var(--primary)' : 'transparent',
                      color: user.role === 'admin' ? '#fff' : 'var(--text-secondary)',
                      border: user.role === 'admin' ? 'none' : '1px solid var(--border)'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.9rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                      Active
                    </div>
                  </td>
                </tr>
              ))}
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

export default AdminUserList;
