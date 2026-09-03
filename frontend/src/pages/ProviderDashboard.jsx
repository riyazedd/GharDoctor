import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Briefcase, Star, CheckCircle, AlertCircle, LogOut, MessageSquare,
  Calendar, Clock, MapPin, Phone, Mail, Activity, TrendingUp, Power, Edit2, Save, Bell
} from 'lucide-react';
import { authAPI, bookingAPI, providerAPI } from '../API';
import { ToastMessages } from '../context/ToastContext';
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
  const [verificationNotice, setVerificationNotice] = useState(null);
  const [hasUnreadVerificationNotice, setHasUnreadVerificationNotice] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const {
    unreadCounts,
    unreadTotal,
    notification,
    notifications,
    clearUnreadForBooking,
    clearAllUnread,
    dismissNotification,
  } = useBookingChatNotifications({
    bookings,
    currentUser: user,
    activeBookingId: activeChatBooking?._id || null,
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;

    if (!userData) {
      navigate('/login');
      return;
    }

    if (!userData.isProvider && !userData.skill) {
      navigate('/');
      return;
    }

    setUser(userData);

    providerAPI.getVerificationNotice()
      .then((response) => {
        setVerificationNotice(response.data.notice);
        setHasUnreadVerificationNotice(Boolean(response.data.hasUnreadNotice));
      })
      .catch(() => {
        setVerificationNotice(null);
        setHasUnreadVerificationNotice(false);
      });

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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Error clearing session cookie:', error);
      }
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

  const updateBookingStatus = async (bookingId, status) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) {
      return;
    }

    try {
      const response = await bookingAPI.updateBooking(bookingId, { status });

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? response.data : booking
        )
      );

      setSuccess(`Booking ${status.toLowerCase()} successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update booking.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ea] px-4">
        <div className="space-y-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[#7d6a62]" />
          <div>
            <h2 className="mb-2 text-2xl font-black tracking-[-0.05em] text-[#201a17]">Not logged in</h2>
            <p className="mb-6 text-[#655d5a]">Please sign in to view your provider dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] px-6 py-3 font-bold text-white shadow-[0_16px_26px_rgba(199,108,68,0.18)] transition-all hover:brightness-105"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scheduledBookings = bookings.filter((booking) => booking.status === 'Scheduled');
  const inProgressBookings = bookings.filter((booking) => booking.status === 'In Progress');
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed');
  const totalNotificationCount = unreadTotal + (hasUnreadVerificationNotice ? 1 : 0);

  const toggleNotificationMenu = () => {
    setNotificationMenuOpen((previous) => {
      const isOpening = !previous;
      if (isOpening) {
        clearAllUnread();
        setHasUnreadVerificationNotice(false);
      }
      return isOpening;
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f1ea] pb-16 pt-8">
      <ToastMessages error={error} success={success} />
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb] p-8 shadow-[0_16px_40px_rgba(61,38,26,0.06)]">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-4">
              <ImageWithFallback
                src={user.avatar || user.profileImg}
                alt={`${user.firstName || 'Provider'} avatar`}
                fallback={user.firstName?.[0] || 'P'}
                className="h-16 w-16 rounded-[20px] border border-[#eadcc7] bg-[#f7efe8] shadow-[0_10px_24px_rgba(70,42,28,0.08)]"
              />
              <div>
                <h1 className="text-3xl font-black tracking-[-0.06em] text-[#201a17]">
                  Welcome, {user.firstName}!
                </h1>
                <p className="mt-1 text-sm text-[#655d5a]">Service Provider Dashboard</p>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-3 md:w-auto md:flex-nowrap">
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleNotificationMenu}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#eadcc7] bg-[#fffaf5] text-[#5b4d49] transition-all hover:text-[#201a17]"
                  aria-label="Open notifications"
                  aria-expanded={notificationMenuOpen}
                >
                  <Bell className="h-5 w-5" />
                  {totalNotificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#d77a4a] px-1 text-[10px] font-bold text-white ring-2 ring-[#fffdfb]">
                      {totalNotificationCount > 99 ? '99+' : totalNotificationCount}
                    </span>
                  )}
                </button>

                {notificationMenuOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] shadow-[0_18px_40px_rgba(61,38,26,0.14)]">
                    <div className="flex items-center justify-between border-b border-[#efe6dc] px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-[#201a17]">Notifications</p>
                        <p className="text-xs text-[#655d5a]">{unreadTotal ? `${unreadTotal} unread message${unreadTotal === 1 ? '' : 's'}` : 'You’re all caught up'}</p>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {verificationNotice && (
                        <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-left">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-rose-900">Provider application rejected</p>
                              <p className="mt-0.5 text-xs text-rose-800">{verificationNotice.message}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {notifications.length > 0 ? notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const booking = bookings.find((bookingItem) => String(bookingItem._id) === String(item.bookingId));
                            if (booking) {
                              openChatForBooking(booking);
                            }
                            setNotificationMenuOpen(false);
                          }}
                          className={`w-full border-b border-[#f0e5d9] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f8f3ee] ${
                            unreadCounts[String(item.bookingId)] > 0 ? 'bg-[#fff8f1]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d77a4a]" />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-[#201a17]">{item.title}</span>
                              <span className="mt-0.5 block line-clamp-2 text-xs text-[#655d5a]">{item.message}</span>
                            </span>
                          </div>
                        </button>
                      )) : !verificationNotice && (
                        <p className="px-4 py-8 text-center text-sm text-[#655d5a]">No notifications yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={toggleAvailability}
                className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-bold transition-all ${
                  user.availability
                    ? 'border border-[#bfd6b4] bg-[#edf6ee] text-[#2f6a44]'
                    : 'border border-[#eadcc7] bg-[#f5efe8] text-[#5f524d]'
                }`}
              >
                <Power className="h-4 w-4" />
                {user.availability ? 'Available' : 'Unavailable'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-full border border-[#eadcc7] bg-[#fffaf5] px-5 py-2.5 font-bold text-[#5b4d49] transition-all hover:text-[#201a17]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 rounded-[20px] border border-[#bfd6b4] bg-[#edf6ee] p-4 text-[#2b5d3f]">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-[20px] border border-[#e9c1b7] bg-[#f9ece9] p-4 text-[#8a4d2b]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {notification && (
          <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-[24px] border border-[#e7ba9a] bg-[#fffdfb] p-4 shadow-[0_18px_40px_rgba(61,38,26,0.12)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#b86845]">New message</p>
                <h3 className="text-sm font-bold text-[#201a17]">{notification.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#655d5a]">{notification.message}</p>
              </div>
              <button
                type="button"
                onClick={dismissNotification}
                className="text-[#7d6a62] transition-colors hover:text-[#201a17]"
              >
                <AlertCircle className="h-5 w-5" />
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
                className="flex-1 rounded-full bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] px-4 py-2 text-sm font-bold text-white transition-colors"
              >
                View chat
              </button>
              <button
                type="button"
                onClick={dismissNotification}
                className="rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-2 text-sm font-semibold text-[#5b4d49] transition-colors hover:text-[#201a17]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6 shadow-[0_14px_32px_rgba(70,42,28,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#7d6a62]">Total Bookings</p>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#201a17]">{bookings.length}</p>
              </div>
              <div className="rounded-2xl bg-[#edf6ee] p-3 text-[#456d4c]">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6 shadow-[0_14px_32px_rgba(70,42,28,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#7d6a62]">Scheduled</p>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#201a17]">{scheduledBookings.length}</p>
              </div>
              <div className="rounded-2xl bg-[#edf6ff] p-3 text-[#3d77a6]">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6 shadow-[0_14px_32px_rgba(70,42,28,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#7d6a62]">In Progress</p>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#201a17]">{inProgressBookings.length}</p>
              </div>
              <div className="rounded-2xl bg-[#fff0d8] p-3 text-[#b5721d]">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6 shadow-[0_14px_32px_rgba(70,42,28,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#7d6a62]">Completed</p>
                <p className="text-3xl font-black tracking-[-0.05em] text-[#201a17]">{completedBookings.length}</p>
              </div>
              <div className="rounded-2xl bg-[#f4efe8] p-3 text-[#8a4d2b]">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-[#eadcc7] pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'border border-[#e7ba9a] bg-[#f9efe6] text-[#8e4d2f]'
                : 'text-[#655d5a] hover:text-[#201a17]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'requests'
                ? 'border border-[#e7ba9a] bg-[#f9efe6] text-[#8e4d2f]'
                : 'text-[#655d5a] hover:text-[#201a17]'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'border border-[#e7ba9a] bg-[#f9efe6] text-[#8e4d2f]'
                : 'text-[#655d5a] hover:text-[#201a17]'
            }`}
          >
            Profile
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="border-b border-[#eadcc7] pb-4 text-2xl font-black tracking-[-0.05em] text-[#201a17]">Overview</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6 lg:col-span-2">
                <h3 className="mb-4 text-lg font-black tracking-[-0.04em] text-[#201a17]">Recent Activity</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking._id || booking.bookingId} className="flex items-center gap-4 rounded-2xl border border-[#f0e5d9] bg-[#f8f3ee] p-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#6f8d60]"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#201a17]">{booking.serviceName}</p>
                          <p className="text-xs text-[#655d5a]">{booking.date} at {booking.time}</p>
                        </div>
                        <span className="rounded-full bg-[#edf6ee] px-2.5 py-1 text-[10px] font-bold text-[#2f6a44]">
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-[#655d5a]">No bookings yet</p>
                )}
              </div>

              <div className="rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6">
                <h3 className="mb-4 text-lg font-black tracking-[-0.04em] text-[#201a17]">Your info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Category</p>
                    <p className="font-semibold text-[#2f2a29]">{user.skill}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Experience</p>
                    <p className="font-semibold text-[#2f2a29]">{user.experience || 0} years</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Status</p>
                    <p className={`font-semibold ${user.availability ? 'text-[#2f6a44]' : 'text-[#655d5a]'}`}>
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
            <h2 className="border-b border-[#eadcc7] pb-4 text-2xl font-black tracking-[-0.05em] text-[#201a17]">Bookings</h2>

            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d77a4a] border-t-transparent" />
                <p className="mt-4 text-[#655d5a]">Loading service requests...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {bookings.map((booking) => (
                  <div key={booking._id || booking.bookingId} className="space-y-4 rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-6 shadow-[0_14px_32px_rgba(70,42,28,0.03)]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-black tracking-[-0.04em] text-[#201a17]">{booking.serviceName}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            booking.status === 'Completed'
                              ? 'bg-[#edf6ee] text-[#2f6a44]'
                              : booking.status === 'In Progress'
                              ? 'bg-[#edf6ff] text-[#3d77a6]'
                              : booking.status === 'Cancelled'
                              ? 'bg-[#f9ece9] text-[#8a4d2b]'
                              : 'bg-[#fff0d8] text-[#b5721d]'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#655d5a]">{booking.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Offered price</p>
                        <p className="text-xl font-black tracking-[-0.05em] text-[#8e4d2f]">Rs. {booking.price}</p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-[#efe6dc] pt-4">
                      <div className="flex items-center gap-3 text-sm text-[#3e3835]">
                        <Calendar className="h-4 w-4 text-[#8e4d2f]" />
                        <span>{booking.date}</span>
                        <Clock className="h-4 w-4 text-[#8e4d2f]" />
                        <span>{booking.time}</span>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-[#3e3835]">
                        <MapPin className="mt-0.5 h-4 w-4 text-[#8e4d2f]" />
                        <span>{booking.address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-[#3e3835]">
                        <User className="h-4 w-4 text-[#8e4d2f]" />
                        <span className="font-semibold">{booking.userName}</span>
                        <Phone className="h-4 w-4 text-[#8e4d2f]" />
                        <span>{booking.userEmail}</span>
                      </div>

                      {booking.instructions && (
                        <div className="rounded-2xl border border-[#f0e5d9] bg-[#f8f3ee] p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Special instructions</p>
                          <p className="text-sm text-[#3e3835]">{booking.instructions}</p>
                        </div>
                      )}

                      <div className="space-y-3 border-t border-[#efe6dc] pt-4">
                        <button
                          onClick={() => openChatForBooking(booking)}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d8d2c7] bg-[#f5f1ee] px-4 py-2.5 text-sm font-semibold text-[#3e3835] transition-all hover:border-[#d0b093] hover:text-[#201a17]"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Open chat
                          {unreadCounts[String(booking._id)] > 0 && (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#d77a4a] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {unreadCounts[String(booking._id)]}
                            </span>
                          )}
                        </button>

                        {booking.status === 'Scheduled' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'Completed')}
                              className="rounded-full border border-[#bfd6b4] bg-[#edf6ee] px-4 py-2 text-sm font-bold text-[#2f6a44] transition-all hover:bg-[#e3f0e7]"
                            >
                              ✓ Complete
                            </button>

                            <button
                              onClick={() => updateBookingStatus(booking._id, 'Cancelled')}
                              className="rounded-full border border-[#e9c1b7] bg-[#f9ece9] px-4 py-2 text-sm font-bold text-[#8a4d2b] transition-all hover:bg-[#f7e1d9]"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        )}

                        {booking.status === 'In Progress' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'Completed')}
                            className="w-full rounded-full border border-[#bfd6b4] bg-[#edf6ee] px-4 py-2 text-sm font-bold text-[#2f6a44] transition-all hover:bg-[#e3f0e7]"
                          >
                            ✓ Mark as completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#d7cab9] bg-[#fffaf5] py-20 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-[#b9a698]" />
                <h3 className="mb-2 text-lg font-bold text-[#2f2a29]">No bookings yet</h3>
                <p className="text-[#655d5a]">You’ll see all bookings assigned to this provider here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6 rounded-[24px] border border-[#eadcc7] bg-[#fffdfb] p-8 shadow-[0_14px_32px_rgba(70,42,28,0.03)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#efe6dc] pb-4">
              <h2 className="text-2xl font-black tracking-[-0.05em] text-[#201a17]">Provider profile</h2>
              <button
                onClick={() => setProfileEditMode((previous) => !previous)}
                className="inline-flex items-center gap-2 rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-2 text-sm font-semibold text-[#5b4d49] transition-all hover:text-[#201a17]"
              >
                <Edit2 className="h-4 w-4" />
                {profileEditMode ? 'View profile' : 'Edit profile'}
              </button>
            </div>

            {profileEditMode ? (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={avatarPreview}
                    alt={`${profileForm.firstName || 'Provider'} avatar preview`}
                    fallback={profileForm.firstName?.[0] || 'P'}
                    className="h-24 w-24 rounded-[20px] border border-[#eadcc7] bg-[#f7efe8]"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Avatar image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] file:mr-3 file:rounded-full file:border-0 file:bg-[#edf6ee] file:px-3 file:py-1.5 file:font-semibold file:text-[#2f6a44]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5"><label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">First name</label><input name="firstName" value={profileForm.firstName} onChange={handleProfileFieldChange} className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] outline-none ring-0 transition focus:border-[#d38b66]" /></div>
                  <div className="space-y-1.5"><label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Last name</label><input name="lastName" value={profileForm.lastName} onChange={handleProfileFieldChange} className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] outline-none ring-0 transition focus:border-[#d38b66]" /></div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5"><label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Email</label><input name="email" type="email" value={profileForm.email} onChange={handleProfileFieldChange} className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] outline-none ring-0 transition focus:border-[#d38b66]" /></div>
                  <div className="space-y-1.5"><label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Phone</label><input name="phone" value={profileForm.phone} onChange={handleProfileFieldChange} className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] outline-none ring-0 transition focus:border-[#d38b66]" /></div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5"><label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Service category</label><input name="skill" value={profileForm.skill} onChange={handleProfileFieldChange} className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] outline-none ring-0 transition focus:border-[#d38b66]" /></div>
                  <div className="space-y-1.5"><label className="pl-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Experience</label><input type="number" name="experience" value={profileForm.experience} onChange={handleProfileFieldChange} className="w-full rounded-full border border-[#eadcc7] bg-[#fffaf5] px-4 py-3 text-sm text-[#201a17] outline-none ring-0 transition focus:border-[#d38b66]" /></div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#f0e5d9] bg-[#f8f3ee] p-4">
                  <input type="checkbox" id="availability" name="availability" checked={profileForm.availability} onChange={handleProfileFieldChange} className="h-5 w-5 rounded-lg accent-[#2f6a44]" />
                  <label htmlFor="availability" className="flex-1 cursor-pointer text-sm text-[#3e3835]">I am available to accept service requests</label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setProfileEditMode(false)} className="flex-1 rounded-full border border-[#eadcc7] bg-[#fffaf5] px-6 py-3 font-semibold text-[#5b4d49] transition-all hover:text-[#201a17]">Cancel</button>
                  <button type="submit" disabled={savingProfile} className="flex-1 rounded-full bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] px-6 py-3 font-bold text-white shadow-[0_16px_26px_rgba(199,108,68,0.18)] transition-all disabled:opacity-60">
                    <span className="inline-flex items-center justify-center gap-2">
                      <Save className="h-4 w-4" />
                      {savingProfile ? 'Saving...' : 'Save profile'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">First name</p><p className="text-lg font-semibold text-[#201a17]">{user.firstName}</p></div>
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Last name</p><p className="text-lg font-semibold text-[#201a17]">{user.lastName}</p></div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Email</p><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#8e4d2f]" /><p className="text-[#3e3835]">{user.email}</p></div></div>
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Phone</p><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#8e4d2f]" /><p className="text-[#3e3835]">{user.phone || 'Not provided'}</p></div></div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Service category</p><div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-[#8e4d2f]" /><p className="text-[#3e3835]">{user.skill || 'Not specified'}</p></div></div>
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Experience</p><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#8e4d2f]" /><p className="text-[#3e3835]">{user.experience || 0} years</p></div></div>
                </div>

                <div className="border-t border-[#efe6dc] pt-6">
                  <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e9c1b7] bg-[#f9ece9] px-6 py-3 font-bold text-[#8a4d2b] transition-all hover:bg-[#f6e0d9]">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
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

