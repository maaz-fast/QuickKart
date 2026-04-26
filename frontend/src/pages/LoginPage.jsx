import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { email, password } = formData;

    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      
      if (data.user.role === 'admin') {
        toast.success(`Welcome back, Admin ${data.user.name.split(' ')[0]}!`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          Welcome back 
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.8em', height: '0.8em' }}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </h1>
        <p className="subtitle">Sign in to continue shopping on QuickKart</p>

        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              data-testid="email-input"
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                data-testid="password-input"
                autoComplete="current-password"
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                )}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-extras">
            <Link
              to="/forgot-password"
              data-testid="forgot-password-link"
              className="forgot-link"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            data-testid="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup" data-testid="signup-link">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
