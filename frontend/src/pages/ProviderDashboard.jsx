import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Briefcase, Star, CheckCircle, AlertCircle, LogOut, MessageSquare,
  Calendar, Clock, MapPin, Phone, Mail, Activity, TrendingUp, Power, Edit2, Save
} from 'lucide-react';
import { bookingAPI, providerAPI } from '../API';
import ChatBox from '../components/ChatBox';
import useBookingChatNotifications from '../hooks/useBookingChatNotifications';
import ImageWithFallback from '../components/ImageWithFallback';

export default function ProviderDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skill: '',
    experience: 0,
    availability: true,
    avatar: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');

  const { unreadCounts, notification, clearUnreadForBooking, dismissNotification } = useBookingChatNotifications({
    bookings,
    currentUser: user,
    activeBookingId: activeChatBooking?._id || null,
  });

  // Check authentication and provider status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    // Check if user is a provider
    if (!userData.isProvider && !userData.skill) {
      navigate('/');
      return;
    }

    setUser(userData);

    const fetchProviderBookings = async () => {
      try {
        const response = await bookingAPI.getProviderBookings(userData._id);
        setBookings(response.data || []);
      } catch (err) {
        console.error('Error fetching provider bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderBookings();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        skill: user.skill || '',
        experience: user.experience || 0,
        availability: user.availability ?? true,
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const toggleAvailability = () => {
    try {
      const updatedUser = { ...user, availability: !user.availability };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess(`Availability turned ${!user.availability ? 'on' : 'off'}`);
      setTimeout(() => setSuccess(''), 3000);
      window.location.reload();
    } catch (err) {
      setError('Failed to update availability');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleProfileFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfileForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setProfileForm((previous) => ({
      ...previous,
      avatar: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError('');

    try {
      const response = await providerAPI.updateMyProfile(profileForm);
      const updatedProvider = response.data.provider;
      setUser((previous) => ({ ...previous, ...updatedProvider }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedProvider }));
      setSuccess('Profile updated successfully');
      setProfileEditMode(false);
    } catch (err) {
      console.error('Error updating provider profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const openChatForBooking = (booking) => {
    setActiveChatBooking(booking);
    clearUnreadForBooking(booking._id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Not Logged In</h2>
            <p className="text-slate-400 mb-6">Please sign in to view your provider dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scheduledBookings = bookings.filter((booking) => booking.status === 'Scheduled');
  const inProgressBookings = bookings.filter((booking) => booking.status === 'In Progress');
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed');

  return (
    <div className="min-h-screen bg-slate-950 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <ImageWithFallback
                src={user.avatar || user.profileImg}
                alt={`${user.firstName || 'Provider'} avatar`}
                fallback={user.firstName?.[0] || 'P'}
                className="w-16 h-16 rounded-2xl shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-extrabold text-slate-100">
                  Welcome, {user.firstName}!
                </h1>
                <p className="text-sm text-slate-400 mt-1">Service Provider Dashboard</p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
              <button
                onClick={toggleAvailability}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all ${
                  user.availability
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 border border-slate-600'
                }`}
              >
                <Power className="w-4 h-4" />
                {user.availability ? 'Available' : 'Unavailable'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 font-bold rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {notification && (
          <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-cyan-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400 mb-1">New message</p>
                <h3 className="text-sm font-bold text-slate-100">{notification.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
              </div>
              <button
                type="button"
                onClick={dismissNotification}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const booking = bookings.find((item) => String(item._id) === String(notification.bookingId));
                  if (booking) {
                    openChatForBooking(booking);
                  }
                  dismissNotification();
                }}
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                View Chat
              </button>
              <button
                type="button"
                onClick={dismissNotification}
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-emerald-400">{bookings.length}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-cyan-400">{scheduledBookings.length}</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">In Progress</p>
                <p className="text-3xl font-bold text-yellow-400">{inProgressBookings.length}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-400">{completedBookings.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 pb-2 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Activity</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking._id || booking.bookingId} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <div className="flex-1">
                          <p className="text-slate-100 font-semibold">{booking.serviceName}</p>
                          <p className="text-xs text-slate-400">{booking.date} at {booking.time}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No bookings yet</p>
                )}
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Your Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Category</p>
                    <p className="text-slate-200 font-semibold">{user.skill}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-slate-200 font-semibold">{user.experience || 0} years</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-semibold ${user.availability ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {user.availability ? '🟢 Available' : '🔴 Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">Bookings</h2>
            
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 mt-4">Loading service requests...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking._id || booking.bookingId}
                    className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all"
                  >
                    {/* Booking Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-100">{booking.serviceName}</h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              booking.status === 'Completed'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : booking.status === 'In Progress'
                                ? 'bg-cyan-500/15 text-cyan-400'
                                : booking.status === 'Cancelled'
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{booking.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Offered Price</p>
                        <p className="text-xl font-bold text-emerald-400">Rs. {booking.price}</p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{booking.date}</span>
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{booking.time}</span>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{booking.address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 font-semibold">{booking.userName}</span>
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{booking.userEmail}</span>
                      </div>

                      {booking.instructions && (
                        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                          <p className="text-xs text-slate-400 font-semibold mb-1">Special Instructions</p>
                          <p className="text-sm text-slate-300">{booking.instructions}</p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-800 flex gap-2">
                        <button
                          onClick={() => openChatForBooking(booking)}
                          className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 font-semibold transition-all"
                        >
                          <span className="inline-flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Open Chat
                            {unreadCounts[String(booking._id)] > 0 && (
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {unreadCounts[String(booking._id)]}
                              </span>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Bookings Yet</h3>
                <p className="text-slate-400">You'll see all bookings assigned to this provider here</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-100">Provider Profile</h2>
              <button
                onClick={() => setProfileEditMode((previous) => !previous)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                {profileEditMode ? 'View Profile' : 'Edit Profile'}
              </button>
            </div>

            {profileEditMode ? (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={avatarPreview}
                    alt={`${profileForm.firstName || 'Provider'} avatar preview`}
                    fallback={profileForm.firstName?.[0] || 'P'}
                    className="w-24 h-24 rounded-2xl"
                  />
                  <div className="space-y-1.5 flex-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Avatar Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100 file:bg-emerald-500/10 file:border-0 file:text-emerald-400 file:font-semibold file:cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">First Name</label><input name="firstName" value={profileForm.firstName} onChange={handleProfileFieldChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Last Name</label><input name="lastName" value={profileForm.lastName} onChange={handleProfileFieldChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100" /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Email</label><input name="email" type="email" value={profileForm.email} onChange={handleProfileFieldChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Phone</label><input name="phone" value={profileForm.phone} onChange={handleProfileFieldChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100" /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Service Category</label><input name="skill" value={profileForm.skill} onChange={handleProfileFieldChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Experience</label><input type="number" name="experience" value={profileForm.experience} onChange={handleProfileFieldChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl text-sm text-slate-100" /></div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <input type="checkbox" id="availability" name="availability" checked={profileForm.availability} onChange={handleProfileFieldChange} className="w-5 h-5 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer accent-emerald-500" />
                  <label htmlFor="availability" className="text-sm text-slate-300 cursor-pointer flex-1">I am available to accept service requests</label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setProfileEditMode(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-slate-100 transition-all">Cancel</button>
                  <button type="submit" disabled={savingProfile} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-60">
                    <Save className="w-4 h-4" />
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">First Name</p><p className="text-lg text-slate-200 font-semibold">{user.firstName}</p></div>
                  <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Last Name</p><p className="text-lg text-slate-200 font-semibold">{user.lastName}</p></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Email</p><div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /><p className="text-slate-300">{user.email}</p></div></div>
                  <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Phone</p><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /><p className="text-slate-300">{user.phone || 'Not provided'}</p></div></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Service Category</p><div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-400" /><p className="text-slate-300">{user.skill || 'Not specified'}</p></div></div>
                  <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Experience</p><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><p className="text-slate-300">{user.experience || 0} years</p></div></div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <button onClick={handleLogout} className="w-full px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-bold rounded-lg transition-all flex items-center justify-center gap-2"><LogOut className="w-5 h-5" />Logout</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ChatBox
        isOpen={Boolean(activeChatBooking)}
        booking={activeChatBooking}
        currentUser={user}
        onClose={() => setActiveChatBooking(null)}
      />
    </div>
  );
}
