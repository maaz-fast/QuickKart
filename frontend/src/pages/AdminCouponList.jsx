import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import BrandedLoader from '../components/common/BrandedLoader';
import ActionMenu, { PencilIcon, TrashIcon } from '../components/common/ActionMenu';

const AdminCouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxUses: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/coupons');
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxUses: coupon.maxUses,
      expiresAt: new Date(coupon.expiresAt).toISOString().slice(0, 16),
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, formData);
        toast.success('Coupon updated successfully!');
      } else {
        await api.post('/admin/coupons', formData);
        toast.success('Coupon created successfully!');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  if (loading) return <BrandedLoader fullPage message="Loading Coupons..." testId="page-loader" />;

  return (
    <div className="container admin-coupons-page" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Coupon Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Create and manage customer discount codes</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          data-testid="admin-coupon-create-button"
        >
          + Create New Coupon
        </button>
      </div>

      <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="admin-table" data-testid="admin-coupon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '14px 16px' }}>Code</th>
              <th style={{ padding: '14px 16px' }}>Type</th>
              <th style={{ padding: '14px 16px' }}>Value</th>
              <th style={{ padding: '14px 16px' }}>Min Order</th>
              <th style={{ padding: '14px 16px' }}>Uses</th>
              <th style={{ padding: '14px 16px' }}>Expires</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No coupons found. Create your first coupon to get started.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--accent)' }}>{c.code}</td>
                  <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{c.discountType}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}
                  </td>
                  <td style={{ padding: '14px 16px' }}>Rs. {c.minOrderValue}</td>
                  <td style={{ padding: '14px 16px' }}>{c.usedCount} / {c.maxUses}</td>
                  <td style={{ padding: '14px 16px' }}>{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.isActive ? '#10b981' : '#ef4444'
                    }}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <ActionMenu
                      items={[
                        {
                          label: 'Edit',
                          icon: <PencilIcon />,
                          onClick: () => handleOpenEditModal(c),
                          testId: `edit-coupon-${c._id}`
                        },
                        {
                          label: 'Delete',
                          icon: <TrashIcon />,
                          isDelete: true,
                          onClick: () => handleDelete(c._id),
                          testId: `delete-coupon-${c._id}`
                        }
                      ]}
                      testId={`coupon-actions-${c._id}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
          }}>
            <h3 style={{ marginTop: 0 }}>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. SUMMER20"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Discount Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    placeholder="20"
                    value={formData.discountValue}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Min Order Amount ($)</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Max Uses</label>
                  <input
                    type="number"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Expiration Date *</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Coupon Active
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponList;
