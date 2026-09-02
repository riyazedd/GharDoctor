import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, ShieldCheck, AlertCircle, Upload } from 'lucide-react';
import { authAPI } from '../API';
import { ToastMessages } from '../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    profileImg: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImg: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.firstName.trim().length < 2 || formData.lastName.trim().length < 2) {
      setError('Please enter a first and last name of at least 2 characters each.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^(?:\+977[-\s]?)?9\d{9}$/.test(formData.phone.trim())) {
      setError('Please enter a valid Nepali mobile number (for example, 9800000000).');
      return;
    }
    if (formData.address.trim().length < 5) {
      setError('Please enter a complete home address.');
      return;
    }
    if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError('Password must be at least 8 characters and include a letter and a number.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.profileImg) {
      setError('Please upload a profile image');
      return;
    }
    if (!formData.profileImg.type.startsWith('image/') || formData.profileImg.size > 5 * 1024 * 1024) {
      setError('Profile image must be an image file no larger than 5 MB.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        profileImg: formData.profileImg,
      });

      const data = response.data;
      setSuccess('Account created successfully! Redirecting...');

      // Store user info (token is now in HTTP-Only cookie)
      localStorage.setItem('user', JSON.stringify(data));

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    } finally {
      // Don't clear loading here since the actual request happens in onloadend
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,109,66,0.16),_transparent_25%),linear-gradient(180deg,#f7f1ea_0%,#f5efe8_100%)] px-4 py-16">
      <ToastMessages error={error} success={success} />
      <div className="w-full max-w-lg">
        <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/90 p-8 shadow-[0_16px_40px_rgba(61,38,26,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-[18px] border border-[#f0d4b5] bg-[#f9efe6] p-3 text-[#b86845]">
              <ShieldCheck className="h-8 w-8 stroke-2" />
            </div>
            <h2 className="text-2xl font-black tracking-[-0.06em] text-[#201a17] sm:text-3xl">Create account</h2>
            <p className="mt-2 text-sm text-[#655d5a]">Join GharDoctor as a home maintenance client</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                  First name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full rounded-full border border-[#eadcc7] bg-[#fffdfb] py-2.5 pl-10 pr-4 text-sm text-[#2b241f] placeholder-[#7b665f] transition-all duration-200 focus:border-[#d38b66] focus:outline-none focus:ring-2 focus:ring-[#f0d4b5]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            {/* Phone & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Home Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Kathmandu, Nepal"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Profile Picture
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all duration-200 bg-slate-950/40"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">
                    {formData.profileImg ? formData.profileImg.name : 'Click to upload profile image'}
                  </span>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-700">
                  <img src={imagePreview} alt="Profile preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, profileImg: null }));
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500/80 hover:bg-rose-600 rounded-lg text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Passwords Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer text-sm tracking-wide"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Socials/Alternative signups */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-cyan-400 hover:underline hover:text-cyan-300"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
