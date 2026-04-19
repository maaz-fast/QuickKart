import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', { email, password, confirmPassword });
      setSuccess(true);
      // Redirect to login after 2.5 seconds
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>
            🎉
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
        <h1>Reset password 🔒</h1>
        <p className="subtitle">
          Setting new password for <strong style={{ color: 'var(--primary-light)' }}>{email}</strong>
        </p>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" data-testid="reset-password-error-message">
            ⚠️ {error}
          </div>
        )}

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
                {showPassword ? '👁️' : '🫣'}
              </button>
            </div>
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
                {showConfirmPassword ? '👁️' : '🫣'}
              </button>
            </div>
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
          <Link to="/forgot-password" data-testid="back-to-forgot-link">
            ← Change email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
