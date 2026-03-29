import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import roleHomePath from '../utils/roleHomePath';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const workspacePath = isAuthenticated ? roleHomePath(user?.role) : '/login';

  return (
    <main className="landing-page">
      <div className="landing-shell">
        <header className="landing-nav">
          <div className="landing-brand">
            <span className="landing-brand-mark">RMS</span>
            <span className="landing-brand-text">Reimbursement Management</span>
          </div>

          <Link className="landing-nav-cta" to={workspacePath}>
            {isAuthenticated ? 'Open Workspace' : 'Login'}
          </Link>
        </header>

        <section className="landing-hero">
          <div className="landing-copy">
            <div className="landing-stickers">
              <span>Zero Spreadsheet Chaos</span>
              <span>Approval Speed x3</span>
              <span>Hackathon Ready Build</span>
            </div>

            <h1>
              Build receipts into
              <br />
              <em>winner-level decisions</em>
            </h1>

            <p>
              A clean command center for teams: submit expenses, route approvals, and close payouts
              with full clarity. No clutter. No delay. Only sharp execution.
            </p>

            <div className="landing-actions">
              <Link className="landing-btn-primary" to="/register">
                Start Your Company Space
              </Link>
              <Link className="landing-btn-ghost" to="/login">
                Sign In
              </Link>
            </div>

            <div className="landing-kpis">
              <article>
                <p>Approval Modes</p>
                <h3>Sequential, Hybrid, Threshold</h3>
              </article>
              <article>
                <p>Smart Intake</p>
                <h3>OCR + Currency-Aware Submission</h3>
              </article>
              <article>
                <p>Team Control</p>
                <h3>Admin, Manager, Employee Roles</h3>
              </article>
            </div>
          </div>

          <div className="landing-visual">
            <div className="curve-square curve-square-main" />
            <div className="curve-square curve-square-accent" />
            <div className="curve-square curve-square-soft" />

            <div className="visual-stack">
              <p className="visual-kicker">Live Product Demo</p>

              <div className="demo-laptop">
                <div className="demo-laptop-top">
                  <div className="demo-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <p>Reimbursement Management Platform</p>
                </div>

                <div className="demo-screen">
                  <iframe
                    src="https://www.youtube.com/embed/XeGprwzKTQc?autoplay=1&mute=1&loop=1&playlist=XeGprwzKTQc&controls=1&rel=0&modestbranding=1"
                    title="Reimbursement Management Platform Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              <p className="demo-note">
                Demo starts automatically in muted mode for smooth browser playback.
              </p>
            </div>
          </div>
        </section>

        <footer className="landing-footer">
          <p>Team Sarthak • Odoo x VIT Pune Hackathon 2026</p>
        </footer>
      </div>
    </main>
  );
}
