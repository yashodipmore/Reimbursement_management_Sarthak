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
        setSelectedCurrency(`${found.currency} — ${found.currencyName}`);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-bg py-8">
      {/* Animated blobs */}
      <div className="blob w-96 h-96 bg-purple-600 -top-20 -right-20" style={{ position: 'absolute' }} />
      <div className="blob w-80 h-80 bg-indigo-600 -bottom-20 -left-20" style={{ position: 'absolute', animationDelay: '4s' }} />
      <div className="blob w-64 h-64 bg-cyan-600 top-1/3 right-1/4" style={{ position: 'absolute', animationDelay: '8s' }} />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 shadow-lg" style={{ boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}>
            <span className="text-2xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Register Company</h1>
          <p className="text-slate-400">First user becomes the company admin</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8" style={{ boxShadow: 'var(--shadow-glow)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            {/* Company Name */}
            <div>
              <label htmlFor="register-company" className="block text-sm font-medium text-slate-300 mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="register-company"
                  type="text"
                  placeholder="Acme Corporation"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 outline-none"
                  {...register('companyName', {
                    required: 'Company name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>
              )}
            </div>

            {/* Your Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 outline-none"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="register-email"
                  type="email"
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 outline-none"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 outline-none"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  id="toggle-register-password"
                >
                  {showPassword ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Country Dropdown */}
            <div>
              <label htmlFor="register-country" className="block text-sm font-medium text-slate-300 mb-1.5">
                Country
              </label>
              <div className="relative">
                <HiOutlineGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <select
                  id="register-country"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 outline-none appearance-none cursor-pointer"
                  {...register('country', { required: 'Country is required' })}
                  disabled={loadingCountries}
                >
                  <option value="" className="bg-slate-800">
                    {loadingCountries ? 'Loading countries...' : 'Select your country'}
                  </option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name} className="bg-slate-800">
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.country && (
                <p className="mt-1 text-xs text-red-400">{errors.country.message}</p>
              )}
            </div>

            {/* Auto-detected Currency */}
            {selectedCurrency && (
              <div className="flex items-center gap-3 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl animate-fade-in" id="detected-currency">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💰</span>
                </div>
                <div>
                  <p className="text-xs text-indigo-300 font-medium">Detected Currency</p>
                  <p className="text-sm text-white font-semibold">{selectedCurrency}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              id="register-submit-btn"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg mt-2"
              style={{ boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating your company...
                </span>
              ) : (
                'Register Company'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-slate-400" style={{ background: 'rgba(30, 41, 59, 0.7)' }}>
                or
              </span>
            </div>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            id="google-register-btn"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 font-medium hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </button>

          {/* Login Link */}
          <p className="text-center mt-5 text-slate-400 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              id="login-link"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-slate-500 text-xs">
          Reimbursement Management System • Team Sarthak
        </p>
      </div>
    </div>
  );
}
