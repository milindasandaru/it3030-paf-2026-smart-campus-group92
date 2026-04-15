import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/* ─── tiny icon helpers ─── */
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const SunIcon = () => <Icon d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />;
const MoonIcon = () => <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
const MenuIcon = () => <Icon d="M3 12h18M3 6h18M3 18h18" />;
const CloseIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;

const features = [
  {
    icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    title: 'Resource Booking',
    desc: 'Reserve lecture halls, labs, and equipment in seconds. Real-time availability, instant confirmation.',
  },
  {
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6m-3 4v6m-3-3h6',
    title: 'Ticket Management',
    desc: 'Submit maintenance requests and track them end-to-end. No more lost emails or missed issues.',
  },
  {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0',
    title: 'Smart Notifications',
    desc: 'Stay informed with real-time alerts for bookings, updates, and campus announcements.',
  },
  {
    icon: 'M3 3h18v18H3zM3 9h18M9 21V9',
    title: 'Admin Dashboard',
    desc: 'Comprehensive oversight of all campus operations, users, and resources in one unified panel.',
  },
  {
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 4v6m3-3h-6',
    title: 'Student Management',
    desc: 'Administrators control all student accounts. A seamless, secure registration process.',
  },
  {
    icon: 'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0 8V9m0 0L9 7',
    title: 'Campus Map',
    desc: 'Interactive floor plans and building directories to help everyone navigate the campus with ease.',
  },
];

const stats = [
  { value: '12,000+', label: 'Students Served' },
  { value: '340+', label: 'Resources Available' },
  { value: '98%', label: 'Booking Satisfaction' },
  { value: '24/7', label: 'Platform Uptime' },
];

const navLinks = ['Features', 'About', 'Stats', 'Contact'];



export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lp-root" data-theme={theme}>
      {/* ── Navbar ── */}
      <header className="lp-nav">
        <div className="lp-nav__inner">
          <a href="#" className="lp-logo" aria-label="Smart Campus home">
            <span className="lp-logo__icon" aria-hidden="true">🎓</span>
            <span>Smart<strong>Campus</strong></span>
          </a>

          <nav className="lp-nav__links" aria-label="Main navigation">
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="lp-nav__link">
                {l}
              </a>
            ))}
          </nav>

          <div className="lp-nav__actions">
            <button
              id="theme-toggle"
              className="lp-icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <Link id="nav-login-btn" to="/login" className="lp-btn lp-btn--primary">
              Login
            </Link>
            <button
              className="lp-icon-btn lp-mobile-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <nav className="lp-mobile-nav" aria-label="Mobile navigation">
            {navLinks.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="lp-mobile-nav__link"
                onClick={() => setMenuOpen(false)}
              >
                {l}
              </a>
            ))}
            <Link to="/login" className="lp-btn lp-btn--primary lp-mobile-login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          </nav>
        )}
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="lp-hero" id="hero" aria-labelledby="hero-heading">
          <div className="lp-hero__glow lp-hero__glow--1" aria-hidden="true" />
          <div className="lp-hero__glow lp-hero__glow--2" aria-hidden="true" />
          <div className="lp-container lp-hero__content">
            <div className="lp-hero__badge">🚀 Next-Generation Campus Platform</div>
            <h1 id="hero-heading" className="lp-hero__title">
              Your campus,<br />
              <span className="lp-gradient-text">intelligently managed.</span>
            </h1>
            <p className="lp-hero__sub">
              Smart Campus unifies resource booking, facility ticketing, and campus communications into one elegant, powerful platform — designed for students and administrators alike.
            </p>
            <div className="lp-hero__cta">
              <Link id="hero-login-btn" to="/login" className="lp-btn lp-btn--primary lp-btn--lg">
                Login to Portal
              </Link>
              <a href="#features" className="lp-btn lp-btn--ghost lp-btn--lg">
                Explore Features
              </a>
            </div>
            <p className="lp-hero__note">
              🔒 Admin-managed accounts &mdash; contact your campus administrator to get registered.
            </p>
          </div>

          {/* floating dashboard card mockup */}
          <div className="lp-hero__visual" aria-hidden="true">
            <div className="lp-mockup">
              <div className="lp-mockup__bar">
                <span /><span /><span />
              </div>
              <div className="lp-mockup__body">
                <div className="lp-mockup__sidebar">
                  {['Dashboard', 'Resources', 'Bookings', 'Tickets', 'Admin'].map((item) => (
                    <div key={item} className="lp-mockup__nav-item">{item}</div>
                  ))}
                </div>
                <div className="lp-mockup__content">
                  <div className="lp-mockup__metric">
                    <div className="lp-mockup__metric-val">48</div>
                    <div className="lp-mockup__metric-lbl">Bookings Today</div>
                  </div>
                  <div className="lp-mockup__metric">
                    <div className="lp-mockup__metric-val">12</div>
                    <div className="lp-mockup__metric-lbl">Open Tickets</div>
                  </div>
                  <div className="lp-mockup__chart">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="lp-mockup__bar-item" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="lp-stats" id="stats" aria-labelledby="stats-heading">
          <div className="lp-container">
            <h2 id="stats-heading" className="lp-visually-hidden">Campus Statistics</h2>
            <div className="lp-stats__grid">
              {stats.map(({ value, label }) => (
                <div key={label} className="lp-stat-card">
                  <div className="lp-stat-card__value">{value}</div>
                  <div className="lp-stat-card__label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="lp-features" id="features" aria-labelledby="features-heading">
          <div className="lp-container">
            <div className="lp-section-header">
              <div className="lp-eyebrow">What We Offer</div>
              <h2 id="features-heading" className="lp-section-title">
                Everything your campus needs,<br />in one platform.
              </h2>
              <p className="lp-section-sub">
                From booking a lecture hall to tracking a maintenance request — Smart Campus handles it all with elegance and efficiency.
              </p>
            </div>
            <div className="lp-features__grid">
              {features.map(({ icon, title, desc }) => (
                <article key={title} className="lp-feat-card">
                  <div className="lp-feat-card__icon" aria-hidden="true">
                    <Icon d={icon} size={24} />
                  </div>
                  <h3 className="lp-feat-card__title">{title}</h3>
                  <p className="lp-feat-card__desc">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="lp-about" id="about" aria-labelledby="about-heading">
          <div className="lp-container lp-about__inner">
            <div className="lp-about__text">
              <div className="lp-eyebrow">About the Platform</div>
              <h2 id="about-heading" className="lp-section-title">Built for modern campuses.</h2>
              <p>
                Smart Campus is an integrated operations hub developed to streamline university administration. Administrators have complete control over resources, students, and facilities — while students enjoy a seamless, intuitive interface to interact with campus services.
              </p>
              <p>
                With no open sign-ups, access is securely managed by your campus administrator, ensuring data integrity and a trusted community on the platform.
              </p>
              <Link to="/login" className="lp-btn lp-btn--primary" id="about-login-btn">
                Access the Portal
              </Link>
            </div>
            <div className="lp-about__cards" aria-hidden="true">
              <div className="lp-about__card lp-about__card--1">
                <div className="lp-about__card-icon">🏛️</div>
                <div>Facility Management</div>
              </div>
              <div className="lp-about__card lp-about__card--2">
                <div className="lp-about__card-icon">📅</div>
                <div>Smart Scheduling</div>
              </div>
              <div className="lp-about__card lp-about__card--3">
                <div className="lp-about__card-icon">🔔</div>
                <div>Instant Notifications</div>
              </div>
              <div className="lp-about__card lp-about__card--4">
                <div className="lp-about__card-icon">🛡️</div>
                <div>Secure Access Control</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="lp-cta" id="contact" aria-labelledby="cta-heading">
          <div className="lp-cta__glow" aria-hidden="true" />
          <div className="lp-container lp-cta__inner">
            <h2 id="cta-heading" className="lp-cta__title">
              Ready to experience a smarter campus?
            </h2>
            <p className="lp-cta__sub">
              Log in with your campus credentials to get started. Need an account? Contact your administrator.
            </p>
            <Link id="cta-login-btn" to="/login" className="lp-btn lp-btn--white lp-btn--lg">
              Login Now →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer__inner">
          <div className="lp-footer__brand">
            <span className="lp-logo__icon">🎓</span>
            <span>Smart<strong>Campus</strong></span>
          </div>
          <p className="lp-footer__copy">
            © {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.
          </p>
          <div className="lp-footer__links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}