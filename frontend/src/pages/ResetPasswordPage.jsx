import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from ForgotPasswordPage via router state
  const email = location.state?.email;

  // Guard: redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm your new password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { password, confirmPassword } = formData;

    try {
      setLoading(true);
      await api.post('/auth/reset-password', { email, password, confirmPassword });
      setSuccess(true);
      toast.success('Password reset successfully!');
      // Redirect to login after 2.5 seconds
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--success)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </span>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>Password Reset!</h1>
          <p className="subtitle" data-testid="reset-password-success-message">
            Your password has been updated successfully. Redirecting to login...
          </p>
          <div className="spinner" style={{ margin: '24px auto 0' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          Reset password 
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.8em', height: '0.8em' }}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </h1>
        <p className="subtitle">
          Setting new password for <strong style={{ color: 'var(--primary-light)' }}>{email}</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="reset-password-form" noValidate>
          <div className="form-group">
            <label htmlFor="reset-password">New Password</label>
            <div className="password-wrapper">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                data-testid="new-password-input"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="password-toggle-button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                )}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reset-confirm-password">Confirm New Password</label>
            <div className="password-wrapper">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'input-error' : ''}
                data-testid="confirm-new-password-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                data-testid="confirm-password-toggle-button"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            data-testid="reset-password-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" /> Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <Link to="/forgot-password" data-testid="back-to-forgot-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Change email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
