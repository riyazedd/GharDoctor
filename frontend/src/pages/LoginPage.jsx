import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI } from '../API';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, try to login as a regular user
      const userResponse = await authAPI.loginUser(email, password);
      const data = userResponse.data;
      setSuccess('Login successful! Redirecting...');
      
      // Store user info (token is now in HTTP-Only cookie)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      setTimeout(() => {
        // Check if user is admin and redirect accordingly
        if (data.isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
      return;
    } catch (userErr) {
      // If regular user login fails, try service provider login
      try {
        const providerResponse = await authAPI.loginProvider(email, password);
        const data = providerResponse.data;
        setSuccess('Login successful! Redirecting to provider dashboard...');
        
        // Store user info (token is now in HTTP-Only cookie)
        localStorage.setItem('user', JSON.stringify(data));
        
        setTimeout(() => {
          // Redirect to provider dashboard for service providers
          if (data.isServiceProvider) {
            navigate('/provider-dashboard');
          } else {
            navigate('/');
          }
        }, 1000);
        return;
      } catch (providerErr) {
        // If both fail, show error
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (e) => {
    e.preventDefault();
    setEmail('john@example.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-radial from-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        {/* Card wrapper */}
        <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 mb-4 shadow-lg shadow-cyan-500/5">
              <ShieldCheck className="w-8 h-8 stroke-2" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-2">Access your GharDoctor account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-medium text-cyan-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-12 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer text-sm tracking-wide"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Socials/Alternative signups */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            {/* Quick credentials filler */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 mb-6 text-center">
              <p className="text-xs text-slate-400 leading-normal mb-2.5">
                Need to test the app? Use the seeded credentials:
              </p>
              <button
                onClick={fillTestCredentials}
                className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-xl transition-all duration-200"
              >
                Autofill Seed Credentials
              </button>
            </div>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-semibold text-cyan-400 hover:underline hover:text-cyan-300"
              >
                Sign Up Now
              </a>
            </p>

            <p className="text-center text-sm text-slate-400 mt-4">
              Want to provide services?{' '}
              <a
                href="/provider-register"
                className="font-semibold text-emerald-400 hover:underline hover:text-emerald-300"
              >
                Join as Expert
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
