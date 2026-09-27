import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = PhoneInputPkg.default ? PhoneInputPkg.default : PhoneInputPkg;

const AddressBook = ({ onSelectAddress, selectedAddressId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const fetchAddresses = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/addresses');
      if (data.success) {
        setAddresses(data.addresses);
        // If onSelectAddress is provided and no address is selected yet, select default
        if (onSelectAddress && data.addresses.length > 0 && !selectedAddressId) {
          const defaultAddr = data.addresses.find(a => a.isDefault) || data.addresses[0];
          onSelectAddress(defaultAddr);
        }
      }
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [onSelectAddress, selectedAddressId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleOpenEditForm = (addr) => {
    setEditingId(addr._id);
    setFormData({
      label: addr.label || 'Home',
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode,
      country: addr.country || 'Pakistan',
      isDefault: addr.isDefault,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.phone || formData.phone.trim().length < 7) errs.phone = 'Valid phone is required';
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal Code is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/users/me/addresses/${editingId}`, formData);
        toast.success('Address updated successfully');
        if (onSelectAddress && selectedAddressId === editingId) {
          onSelectAddress(data.address);
        }
      } else {
        const { data } = await api.post('/users/me/addresses', formData);
        toast.success('Address added successfully');
        if (onSelectAddress) {
          onSelectAddress(data.address);
        }
      }
      setShowForm(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/users/me/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.patch(`/users/me/addresses/${id}/default`);
      toast.success('Default address updated');
      fetchAddresses();
      if (onSelectAddress) {
        onSelectAddress(data.address);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div className="address-book-section" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.1em', height: '1.1em' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Saved Addresses
        </h3>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleOpenAddForm}
          data-testid="address-add-button"
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          + Add New Address
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading addresses...</p>
      ) : addresses.length === 0 && !showForm ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border)'
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No saved addresses yet. Add your first address for faster checkout!</p>
        </div>
      ) : null}

      {/* Address List */}
      <div className="address-list" data-testid="address-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr._id;
          return (
            <div
              key={addr._id}
              data-testid={`address-card-${addr._id}`}
              onClick={() => onSelectAddress && onSelectAddress(addr)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                cursor: onSelectAddress ? 'pointer' : 'default',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {addr.label || 'Home'}
                </span>
                {addr.isDefault && (
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'var(--accent)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Default
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{addr.fullName}</p>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {addr.country} • {addr.phone}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {!addr.isDefault && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid="address-set-default-button"
                    onClick={(e) => handleSetDefault(addr._id, e)}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  data-testid="address-edit-button"
                  onClick={(e) => { e.stopPropagation(); handleOpenEditForm(addr); }}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  data-testid="address-delete-button"
                  onClick={(e) => handleDelete(addr._id, e)}
                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--error)', borderColor: 'var(--error)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form Modal / Box */}
      {showForm && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '15px' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h4>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Address Label</label>
                <input
                  type="text"
                  name="label"
                  placeholder="Home, Work, etc."
                  value={formData.label}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  className={errors.fullName ? 'input-error' : ''}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Phone Number *</label>
                <PhoneInput
                  country={'pk'}
                  value={formData.phone}
                  onChange={(phone) => {
                    setFormData((prev) => ({ ...prev, phone }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  inputStyle={{
                    width: '100%',
                    padding: '10px 14px 10px 48px',
                    background: 'var(--bg-input)',
                    border: errors.phone ? '1px solid var(--error)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    height: '43px',
                  }}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                name="addressLine1"
                placeholder="Street address, house no."
                value={formData.addressLine1}
                onChange={handleFormChange}
                className={errors.addressLine1 ? 'input-error' : ''}
              />
              {errors.addressLine1 && <span className="field-error">{errors.addressLine1}</span>}
            </div>

            <div className="form-group">
              <label>Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                placeholder="Apartment, suite, unit, etc."
                value={formData.addressLine2}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Lahore"
                  value={formData.city}
                  onChange={handleFormChange}
                  className={errors.city ? 'input-error' : ''}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State / Province</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Punjab"
                  value={formData.state}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Postal / ZIP Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="54000"
                  value={formData.postalCode}
                  onChange={handleFormChange}
                  className={errors.postalCode ? 'input-error' : ''}
                />
                {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleFormChange}
                  />
                  Set as default shipping address
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
