import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!email.trim()) newErrors.email = 'Please enter your email address';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      toast.success('Email verified successfully!');
      // Navigate to reset page carrying the email as state
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <h1>Forgot password? 🔑</h1>
        <p className="subtitle">
          Enter your registered email and we&apos;ll allow you to reset your password
        </p>
        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="forgot-password-form" noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className={errors.email ? 'input-error' : ''}
              data-testid="email-input"
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            data-testid="forgot-password-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" /> Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Remembered your password?{' '}
          <Link to="/login" data-testid="back-to-login-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
