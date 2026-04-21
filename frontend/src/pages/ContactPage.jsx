import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/support', formData);
      setSubmitted(true);
      toast.success('Message sent! We will contact you soon.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="success-overlay" style={{ marginTop: '60px' }}>
          <div className="success-icon" style={{ fontSize: '4rem', color: 'var(--success)' }}>✉️</div>
          <h2>Message Received!</h2>
          <p>Thank you for reaching out to QuickKart support. Our team will review your query and respond to <strong>{formData.email}</strong> shortly.</p>
          <button className="btn btn-primary" onClick={() => setSubmitted(false)} style={{ marginTop: '20px' }}>
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container contact-page">
      <div className="page-header">
        <h1>Contact Us 📩</h1>
        <p>Have questions or feedback? We&apos;d love to hear from you.</p>
      </div>

      <div className="auth-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className={errors.name ? 'input-error' : ''}
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
              onChange={handleChange}
              placeholder="Your email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What can we help with?"
              className={errors.subject ? 'input-error' : ''}
            />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows="5"
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '120px'
              }}
              className={errors.message ? 'input-error' : ''}
            ></textarea>
            {errors.message && <span className="field-error">{errors.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div className="contact-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '60px' }}>
        <div className="contact-info-card" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '30px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', transition: 'transform 0.3s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'rgba(108, 99, 255, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>📍</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Our Office</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>123 Tech Avenue, Karachi, Pakistan</p>
        </div>
        <div className="contact-info-card" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '30px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', transition: 'transform 0.3s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'rgba(255, 101, 132, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>📞</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Call Us</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>+92 300 1234567</p>
        </div>
        <div className="contact-info-card" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '30px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', transition: 'transform 0.3s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'rgba(67, 233, 123, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>📧</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Email Us</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>support@quickkart.com</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
