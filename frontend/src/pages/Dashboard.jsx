import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Clock, MapPin, Phone, Mail,
  CheckCircle, AlertCircle, Trash2, LogOut, Home,
  ArrowRight
} from 'lucide-react';
import { authAPI, bookingAPI } from '../API';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getUserBookings(user._id);
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [token, user, navigate]);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(bookingId);
      const updatedBookings = bookings.map((booking) =>
        booking._id === bookingId ? { ...booking, status: 'Cancelled' } : booking
      );
      setBookings(updatedBookings);
      setSuccess('Booking cancelled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Error clearing session cookie:', error);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ea] px-4">
        <div className="space-y-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[#7d6a62]" />
          <div>
            <h2 className="mb-2 text-2xl font-black tracking-[-0.05em] text-[#201a17]">Not logged in</h2>
            <p className="mb-6 text-[#655d5a]">Please sign in to view your dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-[#d77a4a] px-6 py-3 text-sm font-bold text-white"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f1ea] pb-16 pt-8">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="border-b border-[#f0e5d9] py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={user.profileImg}
                alt={`${user.firstName || 'User'} profile`}
                fallback={user.firstName?.[0] || 'U'}
                className="h-14 w-14 rounded-[16px] object-cover"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a5a3c]">Dashboard</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#201a17]">
                  Welcome back, {user.firstName}!
                </h1>
              </div>
            </div>

            <div className="flex w-full gap-3 lg:w-auto">
              <button
                onClick={() => navigate('/services')}
                className="flex-1 rounded-full bg-[#d77a4a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96838] lg:flex-none"
              >
                Book service
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-full border border-[#d4c4b6] bg-[#fffdfb] px-5 py-2.5 text-sm font-bold text-[#4e4643] hover:border-[#c9b3a0] lg:flex-none"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {success && (
          <div className="flex items-center gap-3 rounded-[22px] border border-[#b9d4b0] bg-[#edf6ee] p-4 text-sm font-semibold text-[#2b5d3f]">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-[22px] border border-[#e6b7ad] bg-[#f9ece9] p-4 text-sm font-semibold text-[#8a4d2b]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-2 border-b border-[#eadcc7] pb-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'bookings' ? 'bg-[#f5e9df] text-[#8e4d2f]' : 'text-[#655d5a]'
            }`}
          >
            My bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'profile' ? 'bg-[#f5e9df] text-[#8e4d2f]' : 'text-[#655d5a]'
            }`}
          >
            Profile
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.75fr]">
            <section className="space-y-5">
              {loadingBookings ? (
                <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-12 text-center">
                  <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#d58c63] border-t-transparent" />
                  <p className="mt-4 text-sm text-[#655d5a]">Loading your bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div key={booking._id} className="border-b border-[#f0e5d9] py-6 sm:py-7">
                    <div className="flex flex-col gap-4 border-b border-[#efe0d0] pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Service</p>
                        <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#201a17]">{booking.serviceName}</h3>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                            booking.status === 'Scheduled'
                              ? 'bg-[#edf4ee] text-[#3d6a4b]'
                              : booking.status === 'Completed'
                              ? 'bg-[#f4efe4] text-[#8e6d2c]'
                              : 'bg-[#f1ece8] text-[#7c6b63]'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Date & time</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                            <Calendar className="h-4 w-4 text-[#b86845]" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                            <Clock className="h-4 w-4 text-[#b86845]" />
                            <span>{booking.time}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Location</p>
                          <div className="mt-1 flex items-start gap-2 text-sm text-[#4c4441]">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b86845]" />
                            <span>{booking.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Professional</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                            <User className="h-4 w-4 text-[#b86845]" />
                            <span>{booking.providerName}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                            <Phone className="h-4 w-4 text-[#b86845]" />
                            <span>{booking.providerPhone}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Price</p>
                          <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#b86845]">Rs. {booking.price}</p>
                        </div>
                      </div>
                    </div>

                    {booking.instructions && (
                      <div className="mt-4 rounded-[18px] border border-[#efe0d0] bg-[#faf5f0] p-3 text-sm text-[#4c4441]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Instructions</p>
                        <p className="mt-2">{booking.instructions}</p>
                      </div>
                    )}

                    {booking.status === 'Scheduled' && (
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="flex items-center gap-2 rounded-full border border-[#e2c4b6] bg-[#fff5f1] px-4 py-2 text-sm font-bold text-[#8a4d2b]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancel booking
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-[#e2c8b2] bg-[#fffdfb]/80 p-12 text-center">
                  <Home className="mx-auto mb-4 h-12 w-12 text-[#7d6a62]" />
                  <h3 className="text-xl font-black tracking-[-0.04em] text-[#201a17]">No bookings yet</h3>
                  <p className="mt-2 text-sm text-[#655d5a]">You haven’t scheduled any services yet.</p>
                  <button
                    onClick={() => navigate('/services')}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d77a4a] px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Browse services
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Account</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#201a17]">Overview</h2>

                <div className="mt-5 space-y-4">
                  <div className="border-b border-[#efe0d0] pb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Name</p>
                    <p className="mt-1 text-base font-bold text-[#201a17]">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="border-b border-[#efe0d0] pb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Email</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                      <Mail className="h-4 w-4 text-[#b86845]" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="border-b border-[#efe0d0] pb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Phone</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                      <Phone className="h-4 w-4 text-[#b86845]" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Address</p>
                    <div className="mt-1 flex items-start gap-2 text-sm text-[#4c4441]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b86845]" />
                      <span>{user.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-3xl rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 sm:p-8">
            <div className="border-b border-[#efe0d0] pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Profile</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#201a17]">Account information</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">First name</p>
                  <p className="mt-1 text-lg font-bold text-[#201a17]">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Last name</p>
                  <p className="mt-1 text-lg font-bold text-[#201a17]">{user.lastName}</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Email</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                    <Mail className="h-4 w-4 text-[#b86845]" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Phone</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                    <Phone className="h-4 w-4 text-[#b86845]" />
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Address</p>
                <div className="mt-1 flex items-start gap-2 text-sm text-[#4c4441]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b86845]" />
                  <span>{user.address || 'Not provided'}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#efe0d0]">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e2c4b6] bg-[#fff5f1] px-6 py-3 text-sm font-bold text-[#8a4d2b]"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
