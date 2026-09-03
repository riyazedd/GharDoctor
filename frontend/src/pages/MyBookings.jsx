import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Phone, User,
  CheckCircle, AlertCircle, Trash2, Home, ArrowRight, MessageSquare
} from 'lucide-react';
import { bookingAPI } from '../API';
import { ToastMessages } from '../context/ToastContext';
import ChatBox from '../components/ChatBox';
import useBookingChatNotifications from '../hooks/useBookingChatNotifications';

export default function MyBookings() {
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  const {
    unreadCounts,
    notification,
    clearUnreadForBooking,
    dismissNotification,
  } = useBookingChatNotifications({
    bookings,
    currentUser: user,
    activeBookingId: activeChatBooking?._id || null,
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
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
  }, [navigate]);

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

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking?')) {
      return;
    }

    try {
      await bookingAPI.deleteBooking(bookingId);

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );

      setSuccess('Booking deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openChatForBooking = (booking) => {
    setActiveChatBooking(booking);
    clearUnreadForBooking(booking._id);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ea] px-4">
        <div className="space-y-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[#7d6a62]" />
          <div>
            <h2 className="mb-2 text-2xl font-black tracking-[-0.05em] text-[#201a17]">Not logged in</h2>
            <p className="mb-6 text-[#655d5a]">Please sign in to view your bookings.</p>
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
      <ToastMessages error={error} success={success} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 shadow-[0_18px_38px_rgba(55,33,20,0.04)] sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a5a3c]">Bookings</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#201a17]">My bookings</h1>
              <p className="mt-2 text-sm text-[#655d5a]">Manage and track every service appointment.</p>
            </div>

            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-[#d77a4a] px-5 py-3 text-sm font-bold text-white"
            >
              Book new service
              <ArrowRight className="h-4 w-4" />
            </Link>
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

        {notification && (
          <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-[24px] border border-[#d3bda6] bg-[#201a17] p-4 text-white shadow-2xl shadow-[#201a17]/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f7c28e]">
                  {notification.type === 'booking-status' ? 'Booking update' : 'New message'}
                </p>
                <h3 className="text-sm font-bold text-white">{notification.title}</h3>
                <p className="mt-1 text-sm text-[#d8d0cc]">{notification.message}</p>
              </div>
              <button onClick={dismissNotification} className="text-[#d8d0cc]">
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
                className="flex-1 rounded-full bg-[#d77a4a] px-4 py-2 text-sm font-bold text-white"
              >
                {notification.type === 'booking-status' ? 'View booking' : 'View chat'}
              </button>
              <button
                type="button"
                onClick={dismissNotification}
                className="rounded-full border border-[#4d453f] px-4 py-2 text-sm font-semibold text-[#d8d0cc]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {loadingBookings ? (
          <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-12 text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#d58c63] border-t-transparent" />
            <p className="mt-4 text-sm text-[#655d5a]">Loading your bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <article key={booking._id} className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-[#efe0d0] pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Service</p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#201a17]">{booking.serviceName}</h2>
                  </div>

                  <div className="flex items-center gap-3">
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
                    {unreadCounts[String(booking._id)] > 0 && (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#c75b4d] px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCounts[String(booking._id)]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Date</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                          <Calendar className="h-4 w-4 text-[#b86845]" />
                          <span>{booking.date}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Time</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-[#4c4441]">
                          <Clock className="h-4 w-4 text-[#b86845]" />
                          <span>{booking.time}</span>
                        </div>
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

                  <div className="space-y-4">
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Total</p>
                      <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#b86845]">Rs. {booking.price}</p>
                    </div>
                  </div>
                </div>

                {booking.instructions && (
                  <div className="mt-5 rounded-[18px] border border-[#efe0d0] bg-[#faf5f0] p-3 text-sm text-[#4c4441]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Instructions</p>
                    <p className="mt-2">{booking.instructions}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 border-t border-[#efe0d0] pt-4 sm:flex-row">
                  <button
                    onClick={() => openChatForBooking(booking)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d7b091] bg-[#f9efe7] px-4 py-2.5 text-sm font-bold text-[#8a4d2b]"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Open chat
                    {unreadCounts[String(booking._id)] > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#c75b4d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCounts[String(booking._id)]}
                      </span>
                    )}
                  </button>

                  {booking.status === 'Scheduled' ? (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e2c4b6] bg-[#fff5f1] px-4 py-2.5 text-sm font-bold text-[#8a4d2b]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel booking
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteBooking(booking._id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e2c4b6] bg-[#fff5f1] px-4 py-2.5 text-sm font-bold text-[#8a4d2b]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete booking
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
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
