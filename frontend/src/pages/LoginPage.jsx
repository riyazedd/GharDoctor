import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI } from '../API';
import { ToastMessages } from '../context/ToastContext';

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
      localStorage.setItem('user', JSON.stringify(data));
      
      setTimeout(() => {
        // Check if user is admin and redirect accordingly
        if (data.isAdmin) {
          navigate('/admin/dashboard');
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

  // const fillTestCredentials = (e) => {
  //   e.preventDefault();
  //   setEmail('admin@gmail.com');
  //   setPassword('123456');
  // };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,109,66,0.16),_transparent_25%),linear-gradient(180deg,#f7f1ea_0%,#f5efe8_100%)] px-4 py-16">
      <ToastMessages error={error} success={success} />
      <div className="w-full max-w-md">
        <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/90 p-8 shadow-[0_16px_40px_rgba(61,38,26,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-[18px] border border-[#f0d4b5] bg-[#f9efe6] p-3 text-[#b86845]">
              <ShieldCheck className="h-8 w-8 stroke-2" />
            </div>
            <h2 className="text-2xl font-black tracking-[-0.06em] text-[#201a17] sm:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-[#655d5a]">Access your GharDoctor account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-[18px] border border-[#e9c1b7] bg-[#f9ece9] p-4 text-sm text-[#8a4d2b]">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 rounded-[18px] border border-[#bfd6b4] bg-[#edf6ee] p-4 text-sm text-[#2b5d3f]">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full rounded-full border border-[#eadcc7] bg-[#fffdfb] py-3 pl-11 pr-4 text-sm text-[#2b241f] placeholder-[#7b665f] transition-all duration-200 focus:border-[#d38b66] focus:outline-none focus:ring-2 focus:ring-[#f0d4b5]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-medium text-[#b86845] hover:text-[#8e4a2b]">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full rounded-full border border-[#eadcc7] bg-[#fffdfb] py-3 pl-11 pr-12 text-sm text-[#2b241f] placeholder-[#7b665f] transition-all duration-200 focus:border-[#d38b66] focus:outline-none focus:ring-2 focus:ring-[#f0d4b5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#7d665f] transition-colors hover:text-[#201a17]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_26px_rgba(199,108,68,0.18)] transition-all duration-200 hover:brightness-105 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-[#eee1d5] pt-6">
            <p className="text-center text-sm text-[#655d5a]">
              Don’t have an account?{' '}
              <a href="/register" className="font-semibold text-[#b86845] hover:text-[#8e4a2b]">
                Sign up now
              </a>
            </p>

            <p className="mt-4 text-center text-sm text-[#655d5a]">
              Want to provide services?{' '}
              <a href="/provider-register" className="font-semibold text-[#3d6a4b] hover:text-[#23452e]">
                Join as expert
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
