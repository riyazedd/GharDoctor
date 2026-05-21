import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Clock, MapPin, Phone, Mail,
  CheckCircle, AlertCircle, Trash2, LogOut, Home
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Get user from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Load bookings from localStorage
    const savedBookings = JSON.parse(localStorage.getItem('ghardoctor_bookings') || '[]');
    setBookings(savedBookings);
    setLoadingBookings(false);
  }, [token, user, navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const cancelBooking = (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'Cancelled' } : booking
      );
      localStorage.setItem('ghardoctor_bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
      setSuccess('Booking cancelled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Not Logged In</h2>
            <p className="text-slate-400 mb-6">Please sign in to view your dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg">
              {user.firstName?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100">
                Welcome, {user.firstName}!
              </h1>
              <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/services')}
              className="flex-1 md:flex-none px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all"
            >
              Book Service
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 md:flex-none px-5 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 pb-2 gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-cyan-500/15 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500/15 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {loadingBookings ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 mt-4">Loading your bookings...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all"
                  >
                    {/* Booking Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-100">{booking.serviceName}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            booking.status === 'Scheduled'
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : booking.status === 'Completed'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{booking.category}</p>
                        <p className="text-xs text-slate-500 mt-1">ID: {booking.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                        <p className="text-2xl font-bold text-cyan-400">Rs. {booking.price}</p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-300">{booking.date}</span>
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-300">{booking.time}</span>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{booking.address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-300 font-semibold">{booking.providerName}</span>
                        <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-300">{booking.providerPhone}</span>
                      </div>

                      {booking.instructions && (
                        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                          <p className="text-xs text-slate-400 font-semibold mb-1">Special Instructions</p>
                          <p className="text-sm text-slate-300">{booking.instructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {booking.status === 'Scheduled' && (
                      <div className="pt-4 border-t border-slate-800 flex gap-2">
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-semibold transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <Home className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Bookings Yet</h3>
                <p className="text-slate-400 mb-6">You haven't scheduled any services yet.</p>
                <button
                  onClick={() => navigate('/services')}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all"
                >
                  Browse Services
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">Account Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">First Name</p>
                <p className="text-lg text-slate-200 font-semibold">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Last Name</p>
                <p className="text-lg text-slate-200 font-semibold">{user.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <p className="text-slate-300">{user.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <p className="text-slate-300">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Address</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
                <p className="text-slate-300">{user.address || 'Not provided'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
