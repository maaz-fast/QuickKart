import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useInView from '../hooks/useInView';

/**
 * Public marketing/landing page shown to unauthenticated visitors at `/`.
 * Logged-in users are routed to the product catalog, so this page never
 * blocks authenticated access. Pure CSS animations + a tiny IntersectionObserver
 * hook — no animation library dependency.
 *
 * Every interactive element carries a stable `data-testid` for automation.
 * Scroll-reveal wrapper: fades/slides content in once it enters the viewport.
 */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, isInView] = useInView();
  const classes = [`landing-reveal`, ...(isInView ? ['visible'] : []), ...(className ? [className] : [])].join(' ');
  return (
    <div ref={ref} className={classes} style={delay ? { transitionDelay: `${delay}ms` } : undefined} data-testid="landing-reveal">
      {children}
    </div>
  );
};

const STATS = [
  { id: 'products', value: '500+', label: 'Curated Products' },
  { id: 'categories', value: '10+', label: 'Product Categories' },
  { id: 'security', value: 'JWT', label: 'Secure Auth & RBAC' },
  { id: 'support', value: '24/7', label: 'Support & Monitoring' },
];

const CHIPS = ['React + Vite', 'Express + MongoDB', 'JWT & RBAC', 'Automation-ready'];

const FEATURES = [
  {
    id: 'storefront',
    title: 'Premium Storefront',
    description: 'A glassmorphic, mobile-first catalog with live search, multi-category tabs, and price filtering.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'admin',
    title: 'Admin Command Center',
    description: 'A dedicated dashboard with revenue analytics, product, category, order, and user management.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    title: 'Real-time Notifications',
    description: 'Automatic alerts for orders, broadcasts, and wishlist events polled silently in the background.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    id: 'checkout',
    title: 'Secure Checkout',
    description: 'A multi-step, validated checkout flow with tax math and a branded printable order invoice.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    id: 'wishlist',
    title: 'Smart Wishlist',
    description: 'Save products for later with interactive heart icons synced across the whole session.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: 'logs',
    title: 'Audit Activity Logs',
    description: 'A comprehensive trail of logins, orders, and inventory changes with role filters.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" x2="16" y1="13" y2="13" />
        <line x1="8" x2="16" y1="17" y2="17" />
      </svg>
    ),
  },
];

const LandingPage = () => {
  // Expose a readiness flag for Playwright/Selenium waits (mirrors the app's data-app-ready pattern).
  useEffect(() => {
    document.body.setAttribute('data-landing-ready', 'true');
    return () => document.body.removeAttribute('data-landing-ready');
  }, []);

  return (
    <div className="landing-page" data-testid="landing-page">
      {/* Ambient floating gradient orbs (pure CSS) */}
      <div className="landing-orb landing-orb-1" aria-hidden="true" />
      <div className="landing-orb landing-orb-2" aria-hidden="true" />

      {/* ============ HERO ============ */}
      <section className="landing-hero" data-testid="landing-hero">
        <span className="landing-badge" data-testid="landing-badge">
          <span className="landing-badge-dot" />
          Premium MERN E-Commerce Platform
        </span>

        <h1 className="landing-hero-title" data-testid="landing-hero-title">
          Shop Smarter.
          <br />
          <span className="landing-hero-gradient">Checkout Faster.</span>
        </h1>

        <p className="landing-hero-subtitle" data-testid="landing-hero-subtitle">
          QuickKart is a complete storefront and admin suite — glassmorphic dark UI,
          real-time notifications, wishlists, order tracking, and a full audit trail.
          Built to be loved by shoppers and tested with confidence.
        </p>

        <div className="landing-hero-cta" data-testid="landing-hero-cta">
          <Link to="/signup" className="btn btn-primary btn-lg" data-testid="landing-cta-signup">
            Start Shopping
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.1em', height: '1.1em', marginLeft: '8px' }}>
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg" data-testid="landing-cta-login">
            Sign In
          </Link>
        </div>

        <ul className="landing-chips" data-testid="landing-chips">
          {CHIPS.map((chip) => (
            <li key={chip} className="landing-chip" data-testid={`landing-chip-${chip.toLowerCase().replace(/\W+/g, '-')}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {chip}
            </li>
          ))}
        </ul>
      </section>

      {/* ============ STATS ============ */}
      <Reveal>
        <section className="landing-stats" data-testid="landing-stats">
          {STATS.map((stat) => (
            <div key={stat.id} className="landing-stat" data-testid={`landing-stat-${stat.id}`}>
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </div>
          ))}
        </section>
      </Reveal>

      {/* ============ FEATURES ============ */}
      <Reveal>
        <section className="landing-features" data-testid="landing-features">
          <h2 className="landing-section-title" data-testid="landing-features-title">
            Everything you need, built in
          </h2>
          <p className="landing-section-sub" data-testid="landing-features-sub">
            QuickKart ships with a premium storefront, a full admin command center, and the tooling to test it all with confidence.
          </p>
          <div className="landing-features-grid" data-testid="landing-features-grid">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.id} delay={(index % 3) * 90}>
                <div className="landing-feature-card" data-testid={`landing-feature-${feature.id}`}>
                  <span className="landing-feature-icon" data-testid={`landing-feature-icon-${feature.id}`}>{feature.icon}</span>
                  <h3 data-testid={`landing-feature-title-${feature.id}`}>{feature.title}</h3>
                  <p data-testid={`landing-feature-desc-${feature.id}`}>{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ============ CTA BAND ============ */}
      <Reveal>
        <section className="landing-cta-band" data-testid="landing-cta-band">
          <div className="landing-cta-content">
            <h2 data-testid="landing-cta-title">Ready to explore QuickKart?</h2>
            <p data-testid="landing-cta-sub">
              Sign up in seconds and start shopping — or sign in to pick up where you left off.
            </p>
            <div className="landing-cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg" data-testid="landing-cta-band-signup">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg" data-testid="landing-cta-band-login">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
};

export default LandingPage;