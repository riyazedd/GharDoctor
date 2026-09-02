import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Users, Briefcase, Award, FileText, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Upload, Hash } from 'lucide-react';
import { authAPI, categoryAPI } from '../API';
import { ToastMessages } from '../context/ToastContext';
import ImageWithFallback from '../components/ImageWithFallback';

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [citizenshipImagePreview, setCitizenshipImagePreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [ocrWarning, setOcrWarning] = useState('');
  const [ocrIsNameMismatch, setOcrIsNameMismatch] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    citizenshipNumber: '',
    skill: '',
    experience: '',
    citizenshipImage: null,
    avatar: null,
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
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [name]: file,
        }));

        if (name === 'citizenshipImage') {
          setCitizenshipImagePreview(reader.result);
        }

        if (name === 'avatar') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.firstName.trim().length < 2 || formData.lastName.trim().length < 2) {
      setError('Please enter a first and last name of at least 2 characters each.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
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
    if (!/^(?:\+977[-\s]?)?9\d{9}$/.test(formData.phone.trim())) {
      setError('Please enter a valid Nepali mobile number (for example, 9800000000).');
      return;
    }
    if (formData.citizenshipNumber.replace(/[^a-zA-Z0-9]/g, '').length < 4) {
      setError('Please enter a valid citizenship number.');
      return;
    }
    if (!formData.skill) {
      setError('Please select a service category');
      return;
    }
    if (formData.experience === '' || !Number.isInteger(Number(formData.experience)) || Number(formData.experience) < 0 || Number(formData.experience) > 99) {
      setError('Experience must be a whole number between 0 and 99 years.');
      return;
    }
    if (!formData.citizenshipImage) {
      setError('Citizenship image is required for verification');
      return;
    }
    if (!formData.citizenshipImage.type.startsWith('image/') || formData.citizenshipImage.size > 5 * 1024 * 1024) {
      setError('Citizenship image must be an image file no larger than 5 MB.');
      return;
    }
    if (formData.avatar && (!formData.avatar.type.startsWith('image/') || formData.avatar.size > 5 * 1024 * 1024)) {
      setError('Avatar image must be an image file no larger than 5 MB.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.registerProvider({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        citizenshipNumber: formData.citizenshipNumber,
        skill: formData.skill,
        experience: parseInt(formData.experience),
        availability: formData.availability,
        citizenshipImage: formData.citizenshipImage,
        avatar: formData.avatar,
      });

      const data = response.data;

      // Check OCR verification result from server
      if (data.ocrVerification && !data.ocrVerification.verified) {
        setOcrWarning(data.ocrVerification.message);
        // Track whether it was specifically a name mismatch for targeted UI
        setOcrIsNameMismatch(
          data.ocrVerification.keywordMatch === true && data.ocrVerification.nameMatch === false
        );
      }

      setSuccess('Registration successful! Redirecting to Login Page');
      
      // Store provider info (token is now in HTTP-Only cookie)
      localStorage.setItem('user', JSON.stringify(data));

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(126,141,104,0.14),_transparent_25%),linear-gradient(180deg,#f7f1ea_0%,#f5efe8_100%)] px-4 py-16">
      <ToastMessages error={error} success={success} />
      <div className="w-full max-w-2xl">
        <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/90 p-8 shadow-[0_16px_40px_rgba(61,38,26,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-[18px] border border-[#d9e5d1] bg-[#f1f6ee] p-3 text-[#4f6d4c]">
              <Briefcase className="h-8 w-8 stroke-2" />
            </div>
            <h2 className="text-2xl font-black tracking-[-0.06em] text-[#201a17] sm:text-3xl">Become a service provider</h2>
            <p className="mt-2 text-sm text-[#655d5a]">Join GharDoctor and start earning by providing services</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-[18px] border border-[#e9c1b7] bg-[#f9ece9] p-4 text-sm text-[#8a4d2b]">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 rounded-[18px] border border-[#bfd6b4] bg-[#edf6ee] p-4 text-sm text-[#2b5d3f]">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {ocrWarning && (
              <div className={`flex items-start gap-2.5 p-4 rounded-2xl text-sm border ${
                ocrIsNameMismatch
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">
                    {ocrIsNameMismatch ? 'Name Mismatch — Pending Review' : 'Citizenship Verification Pending'}
                  </p>
                  <p className={ocrIsNameMismatch ? 'text-orange-400/80' : 'text-amber-400/80'}>
                    {ocrWarning}
                  </p>
                </div>
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

            {/* Phone, citizenship number, and service category */}
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
                <label htmlFor="citizenshipNumber" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Citizenship Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Hash className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="citizenshipNumber"
                    name="citizenshipNumber"
                    value={formData.citizenshipNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 12-34-56-78901"
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
                  <div className="mt-2 flex items-center gap-1.5 px-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                </div>
              )}
            </div>

            {/* Avatar Upload */}
            <div className="space-y-1.5">
              <label htmlFor="avatar" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Profile Image
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Upload className="w-5 h-5" />
                </div>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all duration-200 file:bg-emerald-500/10 file:border-0 file:text-emerald-400 file:font-semibold file:cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-400">Used in the navbar, dashboard, and provider cards.</p>
              {avatarPreview && (
                <div className="mt-3 w-28 h-28 rounded-full overflow-hidden border border-emerald-500/20 bg-slate-900/50 p-1">
                  <ImageWithFallback src={avatarPreview} alt="Avatar preview" fallback="P" className="w-full h-full rounded-full" />
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
