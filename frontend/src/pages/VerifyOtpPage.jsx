import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const purpose = location.state?.purpose || new URLSearchParams(location.search).get('purpose') || 'signup';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first digit on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle clipboard paste across any box
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    const cleanDigits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
    if (!cleanDigits) return;

    const newArr = ['', '', '', '', '', ''];
    for (let i = 0; i < cleanDigits.length; i++) {
      newArr[i] = cleanDigits[i];
    }
    setOtpDigits(newArr);
    setError('');

    const nextIdx = Math.min(cleanDigits.length < 6 ? cleanDigits.length : 5, 5);
    if (inputRefs.current[nextIdx]) {
      inputRefs.current[nextIdx].focus();
    }
  };

  // Handle individual digit input
  const handleChange = (index, value) => {
    setError('');
    const cleanVal = value.replace(/[^0-9]/g, '');
    
    if (cleanVal.length > 1) {
      // If multi-digit typed or pasted
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const fullOtp = otpDigits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/verify-otp', {
        email,
        otp: fullOtp,
        purpose,
      });

      if (purpose === 'signup') {
        toast.success('🎉 Account verified! Welcome to QuickKart.');
        if (data.token && data.user) {
          authLogin(data.user, data.token);
          navigate('/');
        } else {
          navigate('/login');
        }
      } else if (purpose === 'password_reset') {
        toast.success('OTP verified! Please set your new password.');
        navigate('/reset-password', {
          state: { resetToken: data.resetToken, email: data.email || email },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);
    setError('');

    try {
      await api.post('/auth/resend-otp', { email, purpose });
      toast.info('A new 6-digit OTP code has been sent to your email.');
      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="admin-card auth-card" style={{ maxWidth: '460px', width: '100%', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(108, 99, 255, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '30px', height: '30px' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px' }}>
            {purpose === 'signup' ? 'Verify Email Address' : 'Security Verification'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Enter the 6-digit code sent to <strong style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</strong>
          </p>
        </div>

        {error && (
          <div 
            className="auth-error-alert" 
            data-testid="otp-error-message"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'left' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main hidden input for automation test accessibility */}
          <input
            type="text"
            data-testid="otp-input"
            value={fullOtp}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              const arr = val.split('');
              setOtpDigits([
                arr[0] || '',
                arr[1] || '',
                arr[2] || '',
                arr[3] || '',
                arr[4] || '',
                arr[5] || '',
              ]);
            }}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
          />

          {/* Visual 6-box input grid */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                style={{
                  width: '50px',
                  height: '56px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: digit ? '2px solid var(--primary-light)' : '1px solid var(--border)',
                  background: 'var(--bg-dark)',
                  color: 'var(--text-primary)',
                  boxShadow: digit ? '0 0 10px rgba(108, 99, 255, 0.3)' : 'none',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || fullOtp.length !== 6}
            data-testid="otp-submit-button"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, borderRadius: '10px', marginBottom: '20px' }}
          >
            {loading ? 'Verifying Code...' : 'Verify & Proceed'}
          </button>
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p style={{ margin: '0 0 12px' }}>
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={!canResend || resending}
              data-testid="otp-resend-button"
              style={{
                background: 'none',
                border: 'none',
                color: canResend ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: canResend ? 'pointer' : 'not-allowed',
                padding: 0,
                textDecoration: canResend ? 'underline' : 'none'
              }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>

          {!canResend && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }} data-testid="otp-timer">
              Resend code available in <strong style={{ color: 'var(--f59e0b, #f59e0b)' }}>{timer}s</strong>
            </p>
          )}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
