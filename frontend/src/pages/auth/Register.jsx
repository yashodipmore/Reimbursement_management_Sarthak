import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
} from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(true);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchedCountry = watch('country');

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
        const data = await res.json();

        const formatted = data
          .map((c) => {
            const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : null;
            return {
              name: c.name.common,
              currency: currencyCode,
              currencyName: currencyCode && c.currencies[currencyCode]
                ? c.currencies[currencyCode].name
                : '',
            };
          })
          .filter((c) => c.currency)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        toast.error('Could not load countries list');
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Auto-detect currency on country change
  useEffect(() => {
    if (watchedCountry) {
      const found = countries.find((c) => c.name === watchedCountry);
      if (found) {
        setSelectedCurrency(`${found.currency} - ${found.currencyName}`);
      }
    } else {
      setSelectedCurrency('');
    }
  }, [watchedCountry, countries]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        country: data.country,
      });
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Company registered successfully! You are now the admin.');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="auth-page auth-fade">
      <div className="auth-shell">
        <aside className="auth-brand">
          <span className="auth-pill">Company onboarding</span>
          <h1>Create your reimbursement workspace in minutes.</h1>
          <p>
            First account company admin banega. Uske baad tum team members add karke approval rules
            set kar sakte ho, aur expenses ko structured workflow me track kar sakte ho.
          </p>
          <ul className="auth-points">
            <li>Country selection se default currency auto-detect ho jayegi.</li>
            <li>Admin dashboard se users, rules, and approvals control karo.</li>
            <li>Login credentials aur Google auth dono supported hain.</li>
          </ul>
        </aside>

        <section className="auth-card" aria-labelledby="register-title">
          <h2 id="register-title" className="auth-card-title">Register company</h2>
          <p className="auth-card-subtitle">Setup details fill karo aur account create karo.</p>

          <form onSubmit={handleSubmit(onSubmit)} id="register-form" noValidate>
            <div className="field">
              <label htmlFor="register-company">Company name</label>
              <div className="input-wrap">
                <HiOutlineOfficeBuilding className="input-icon" aria-hidden="true" />
                <input
                  id="register-company"
                  type="text"
                  placeholder="Acme Corporation"
                  autoComplete="organization"
                  {...register('companyName', {
                    required: 'Company name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                />
              </div>
              {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
            </div>

            <div className="field">
              <label htmlFor="register-name">Your name</label>
              <div className="input-wrap">
                <HiOutlineUser className="input-icon" aria-hidden="true" />
                <input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                />
              </div>
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div className="field">
              <label htmlFor="register-email">Email address</label>
              <div className="input-wrap">
                <HiOutlineMail className="input-icon" aria-hidden="true" />
                <input
                  id="register-email"
                  type="email"
                  placeholder="admin@company.com"
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
              <label htmlFor="register-password">Password</label>
              <div className="input-wrap">
                <HiOutlineLockClosed className="input-icon" aria-hidden="true" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="trailing-btn"
                  id="toggle-register-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiOutlineEyeOff aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div className="field">
              <label htmlFor="register-country">Country</label>
              <div className="input-wrap">
                <HiOutlineGlobe className="input-icon" aria-hidden="true" />
                <select
                  id="register-country"
                  {...register('country', { required: 'Country is required' })}
                  disabled={loadingCountries}
                >
                  <option value="">{loadingCountries ? 'Loading countries...' : 'Select your country'}</option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.country && <p className="error-text">{errors.country.message}</p>}
            </div>

            {selectedCurrency && (
              <div className="currency-chip" id="detected-currency">
                Detected currency: <strong>{selectedCurrency}</strong>
              </div>
            )}

            <button type="submit" disabled={isLoading} id="register-submit-btn" className="btn-primary">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spin" aria-hidden="true" />
                  Creating workspace...
                </span>
              ) : (
                'Register company'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button onClick={handleGoogleSignup} id="google-register-btn" className="btn-alt" type="button">
            <FcGoogle className="text-xl" aria-hidden="true" />
            Sign up with Google
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" id="login-link">
              Sign in
            </Link>
          </p>

          <p className="auth-footnote">Team Sarthak • Odoo x VIT Hackathon</p>
        </section>
      </div>
    </div>
  );
}
