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

          <div className="landing-visual" aria-hidden="true">
            <div className="curve-square curve-square-main" />
            <div className="curve-square curve-square-accent" />
            <div className="curve-square curve-square-soft" />

            <div className="visual-card">
              <p className="visual-kicker">Live approval lane</p>
              <h3>Expense to decision in one motion.</h3>
              <ul>
                <li>Submit and auto-route</li>
                <li>Commented approve or reject</li>
                <li>Audit trail always visible</li>
              </ul>
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
