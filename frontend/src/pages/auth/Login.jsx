import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError === 'google_auth_not_configured') {
      toast.error('Google login is not configured yet. Please use email/password.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken || res.data.token);
      toast.success('Login successful!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="auth-page auth-fade">
      <div className="auth-shell">
        <aside className="auth-brand">
          <span className="auth-pill">Reimbursement Management</span>
          <h1>Track approvals, not spreadsheets.</h1>
          <p>
            Submit expenses, route approvals, and track status in one place. Sign in to view your
            reimbursement pipeline instantly.
          </p>
          <ul className="auth-points">
            <li>Role-based dashboards for employee, manager, and admin.</li>
            <li>Fast approvals with clean audit trail and comments.</li>
            <li>Secure access with password and Google login.</li>
          </ul>
        </aside>

        <section className="auth-card" aria-labelledby="login-title">
          <h2 id="login-title" className="auth-card-title">Welcome back</h2>
          <p className="auth-card-subtitle">Sign in to continue to your workspace.</p>

          <form onSubmit={handleSubmit(onSubmit)} id="login-form" noValidate>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <div className="input-wrap">
                <HiOutlineMail className="input-icon" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <HiOutlineLockClosed className="input-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="trailing-btn"
                  id="toggle-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiOutlineEyeOff aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} id="login-submit-btn" className="btn-primary">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spin" aria-hidden="true" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button onClick={handleGoogleLogin} id="google-login-btn" className="btn-alt" type="button">
            <FcGoogle className="text-xl" aria-hidden="true" />
            Sign in with Google
          </button>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link to="/register" id="register-link">
              Register your company
            </Link>
          </p>

          <p className="auth-footnote">Team Sarthak • Odoo x VIT Hackathon</p>
        </section>
      </div>
    </div>
  );
}
