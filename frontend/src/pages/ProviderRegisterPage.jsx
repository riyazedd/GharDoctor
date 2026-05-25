import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Users, Briefcase, Award, FileText, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import { authAPI, categoryAPI } from '../API';

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [citizenshipImagePreview, setCitizenshipImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skill: '',
    experience: '',
    citizenshipImage: null,
    availability: true,
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          citizenshipImage: reader.result, // Store as base64
        }));
        setCitizenshipImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.skill) {
      setError('Please select a service category');
      return;
    }
    if (!formData.experience || formData.experience < 0) {
      setError('Please enter valid experience (in years)');
      return;
    }
    if (!formData.citizenshipImage) {
      setError('Citizenship image is required for verification');
      return;
    }

    setLoading(true);

    try {
      // Send provider registration with base64 image
      const response = await authAPI.registerProvider({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        skill: formData.skill,
        experience: parseInt(formData.experience),
        availability: formData.availability,
        citizenshipImage: formData.citizenshipImage,
      });

      const data = response.data;
      setSuccess('Registration successful! Logging you in...');
      
      // Store provider info (token is now in HTTP-Only cookie)
      localStorage.setItem('user', JSON.stringify(data));

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-radial from-slate-900 to-slate-950">
      <div className="w-full max-w-2xl">
        {/* Card wrapper */}
        <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-500/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
              <Briefcase className="w-8 h-8 stroke-2" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Become a Service Provider</h2>
            <p className="text-sm text-slate-400 mt-2">Join GharDoctor and start earning by providing services</p>
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
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
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

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone and Service Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+977 9800000000"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="skill" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Service Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <select
                    id="skill"
                    name="skill"
                    value={formData.skill}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <label htmlFor="experience" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Years of Experience
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Award className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="99"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            {/* Citizenship Image Upload */}
            <div className="space-y-1.5">
              <label htmlFor="citizenshipImage" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Citizenship/ID Image
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <FileText className="w-5 h-5" />
                </div>
                <input
                  type="file"
                  id="citizenshipImage"
                  name="citizenshipImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200 file:bg-emerald-500/10 file:border-0 file:text-emerald-400 file:font-semibold file:cursor-pointer"
                />
              </div>
              {citizenshipImagePreview && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-900/50 p-2">
                  <img src={citizenshipImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <input
                type="checkbox"
                id="availability"
                name="availability"
                checked={formData.availability}
                onChange={handleInputChange}
                disabled={loading}
                className="w-5 h-5 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer accent-emerald-500"
              />
              <label htmlFor="availability" className="text-sm text-slate-300 cursor-pointer flex-1">
                I am available to accept service requests
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer text-sm tracking-wide"
            >
              {loading ? 'Creating Account...' : 'Create Provider Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-semibold text-emerald-400 hover:underline hover:text-emerald-300"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
