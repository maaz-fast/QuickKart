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
                <th data-testid="column-avatar">Avatar</th>
                <th data-testid="column-join-date">Join Date</th>
                <th data-testid="column-name">Name</th>
                <th data-testid="column-email">Email</th>
                <th data-testid="column-role">Role</th>
                <th data-testid="column-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} data-testid={`admin-user-row-${user._id}`}>
                  <td data-testid="user-avatar-cell">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="avatar-sm" 
                        data-testid="admin-user-avatar"
                      />
                    ) : (
                      <div className="avatar-sm-placeholder" data-testid="admin-user-avatar" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td data-testid="user-join-date">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td data-testid="user-name">
                    <strong>{user.name}</strong>
                  </td>
                  <td data-testid="user-email">{user.email}</td>
                  <td data-testid="user-role">
                    <span 
                      className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-outline'}`} 
                      data-testid="role-badge"
                      data-state={user.role}
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        background: user.role === 'admin' ? 'var(--primary)' : 'transparent',
                        color: user.role === 'admin' ? '#fff' : 'var(--text-secondary)',
                        border: user.role === 'admin' ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td data-testid="user-status">
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
