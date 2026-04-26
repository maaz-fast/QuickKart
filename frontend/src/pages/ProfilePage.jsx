import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import BrandedLoader from '../components/common/BrandedLoader';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setFormData((prev) => ({
          ...prev,
          name: data.user.name,
          email: data.user.email,
        }));
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setSaving(true);
    try {
      const { data } = await api.put('/users/profile-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local storage and context
      const token = localStorage.getItem('quickkart_token');
      login(data.user, token);
      
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (formData.password) {
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const updateData = { name: formData.name };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const { data } = await api.put('/users/profile', updateData);
      
      // Update local storage and context
      const token = localStorage.getItem('quickkart_token');
      login(data.user, token);
      
      toast.success('Profile updated successfully!');
      
      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <BrandedLoader fullPage message="Loading Profile..." />;

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="page-header">
        <h1 data-testid="profile-page-title">User Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-image-section checkout-form-card" style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3>Profile Picture</h3>
        <div className="profile-image-container" style={{ 
          margin: '20px auto', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center' 
        }}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="avatar-lg" />
          ) : (
            <div className="avatar-lg-placeholder" style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'var(--bg-input)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '3rem',
              color: 'var(--text-muted)',
              border: '2px dashed var(--border)'
            }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="upload-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }}
              data-testid="profile-image-upload"
            />
            {saving ? 'Uploading...' : 'Choose New Photo'}
          </label>
          <small style={{ color: 'var(--text-secondary)' }}>JPG, PNG or JPEG. Max 5MB.</small>
        </div>
      </div>

      <div className="checkout-form-card" style={{ marginTop: '20px' }}>
        <form onSubmit={handleSubmit} data-testid="profile-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              data-testid="profile-name-input"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
              data-testid="profile-email-input"
            />
            <small style={{ color: 'var(--text-secondary)' }}>Email cannot be changed.</small>
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Change Password</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            Leave blank if you do not want to change your password.
          </p>

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              data-testid="profile-password-input"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repeat your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
              data-testid="profile-confirm-password-input"
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={saving}
            data-testid="profile-save-button"
            style={{ marginTop: '20px' }}
          >
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
