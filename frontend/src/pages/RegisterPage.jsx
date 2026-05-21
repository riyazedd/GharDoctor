import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, ShieldCheck, AlertCircle, Upload } from 'lucide-react';

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
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.profileImg) {
      setError('Please upload a profile image');
      setLoading(false);
      return;
    }

    try {
      // Convert image file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          
          const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              password: formData.password,
              profileImg: base64Image,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.message || 'Registration failed');
            setLoading(false);
            return;
          }

          setSuccess('Account created successfully! Redirecting...');
          // Store token if provided
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
          }
          
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } catch (err) {
          setError(err.message || 'Registration failed');
          setLoading(false);
        }
      };
      reader.readAsDataURL(formData.profileImg);
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    } finally {
      // Don't clear loading here since the actual request happens in onloadend
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-radial from-slate-900 to-slate-950">
      <div className="w-full max-w-lg">
        {/* Card wrapper */}
        <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 mb-4 shadow-lg shadow-cyan-500/5">
              <ShieldCheck className="w-8 h-8 stroke-2" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-400 mt-2">Join GharDoctor as a home maintenance client</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
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
