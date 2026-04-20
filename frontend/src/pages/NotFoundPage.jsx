import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: 'var(--primary)' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Page Not Found</h2>
      <p style={{ marginBottom: '40px', color: 'var(--text-secondary)' }}>
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/')}
        data-testid="back-to-home-button"
      >
        Go back to Home
      </button>
    </div>
  );
};

export default NotFoundPage;
