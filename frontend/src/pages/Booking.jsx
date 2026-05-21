import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, FileText, AlertCircle, Sparkles, User, Heart, ArrowRight
} from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import BookingSuccess from '../components/BookingSuccess';

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedService = location.state?.service || null;
  const selectedProviderId = location.state?.selectedProviderId || null;
  const shouldAutoSelectProvider = location.state?.shouldAutoSelectProvider || false;

  // Get auth state from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = !!token;

  // States
  const [activeService, setActiveService] = useState(selectedService || null);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [serviceAddress, setServiceAddress] = useState(user?.address || '');
  const [instructions, setInstructions] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
          if (!activeService && data.length > 0) {
            setActiveService(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Set autofill address from user
  useEffect(() => {
    if (user?.address && !serviceAddress) {
      setServiceAddress(user.address);
    }
  }, [user]);

  // Fetch providers based on selected service category
  useEffect(() => {
    if (!activeService) {
      setProviders([]);
      setSelectedProvider(null);
      return;
    }

    const fetchProviders = async () => {
      try {
        // Always clear selected provider when service changes
        setSelectedProvider(null);
        
        const response = await fetch(
          `http://localhost:3000/api/service-providers/category/${activeService.category}`
        );
        if (response.ok) {
          const data = await response.json();
          setProviders(data);
          
          // Pre-select provider only if explicitly coming from ProviderProfile with shouldAutoSelectProvider flag
          if (shouldAutoSelectProvider && selectedProviderId) {
            const preSelectedProvider = data.find(p => p._id === selectedProviderId);
            if (preSelectedProvider) {
              setSelectedProvider(preSelectedProvider);
            }
          }
        } else {
          console.warn(`Failed to fetch providers: ${response.status}`);
          setProviders([]);
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setProviders([]);
      }
    };

    fetchProviders();
  }, [activeService, selectedProviderId, shouldAutoSelectProvider]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('You must be logged in to schedule a booking.');
      return;
    }

    if (!activeService) {
      setError('Please select a service.');
      return;
    }

    if (!selectedProvider) {
      setError('Please select a service provider.');
      return;
    }

    if (!bookingDate || !bookingTime) {
      setError('Please choose a valid date and time slot.');
      return;
    }

    if (!serviceAddress.trim()) {
      setError('Please provide a service address.');
      return;
    }

    // Create booking object
    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      id: bookingId,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      serviceName: activeService.serviceName,
      price: activeService.price,
      duration: activeService.duration,
      category: activeService.category,
      image: activeService.image,
      providerName: `${selectedProvider.firstName} ${selectedProvider.lastName}`,
      providerPhone: selectedProvider.phone || '9800000000',
      date: bookingDate,
      time: bookingTime,
      address: serviceAddress,
      instructions: instructions || 'No special instructions provided.',
      status: 'Scheduled',
      createdAt: new Date().toLocaleDateString(),
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('ghardoctor_bookings') || '[]');
    localStorage.setItem('ghardoctor_bookings', JSON.stringify([newBooking, ...existingBookings]));

    setBookingDetails(newBooking);
    setSuccess(true);
  };

  // If Booking is successful, render Success screen
  if (success && bookingDetails) {
    return <BookingSuccess bookingDetails={bookingDetails} />;
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 mt-4">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-8">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* 1. Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Schedule Your Appointment
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Configure your service specifications, choose a provider, and finalize scheduling details
          </p>
        </div>

        {!isAuthenticated && (
          <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-cyan-500/2">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shrink-0 self-start md:self-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Authentication Required</h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  You must sign in to secure a scheduled service technician slot and track updates.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="w-full md:w-auto px-5 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-cyan-500/5 cursor-pointer"
              >
                Sign In Now
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full md:w-auto px-5 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* 2. Main Booking Forms Grid */}
        <form
          onSubmit={handleBookingSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          {/* Left 2 Cols: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Form Widget: Service Selection */}
            <div className="p-6.5 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                1. Select Service
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                  Requested Service Type
                </label>
                <select
                  value={activeService?._id || ''}
                  onChange={(e) => {
                    const selected = services.find(s => s._id === e.target.value);
                    setActiveService(selected);
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-200 transition-all cursor-pointer"
                >
                  <option value="">Select a service</option>
                  {services.map(serv => (
                    <option key={serv._id} value={serv._id}>
                      {serv.serviceName} {!serv.isAvailable ? '(Unavailable)' : `(Rs. ${serv.price})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Widget: Provider Select */}
            <div className="p-6.5 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                2. Choose Service Specialist
              </h3>

              {providers.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 pl-1">
                    Available experts for {activeService?.category}:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {providers.map(prov => (
                      <ProviderCard
                        key={prov._id || prov.id}
                        provider={prov}
                        isSelected={selectedProvider?._id === prov._id}
                        isAvailable={prov.isAvailable !== false}
                        onSelect={setSelectedProvider}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-950/20 rounded-2xl border border-slate-850">
                  <p className="text-xs text-slate-500">
                    {activeService ? 'No providers available for this service' : 'Select a service first'}
                  </p>
                </div>
              )}
            </div>

            {/* Form Widget: Schedule Date & Address */}
            <div className="p-6.5 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                3. Date, Time & Logistics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Appointment Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-200 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Time Slot
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <select
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-200 transition-all cursor-pointer"
                    >
                      <option value="">Select a time slot</option>
                      <option value="09:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                      <option value="11:30 AM">11:30 AM - 01:30 PM (Mid-day)</option>
                      <option value="02:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                      <option value="04:30 PM">04:30 PM - 06:30 PM (Evening)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                  Full Service Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, City, Kathmandu"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                  Special Instructions (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-4 pointer-events-none text-slate-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    placeholder="Provide instructions (e.g., call upon arrival, gate passcode, specific repair notes)"
                    rows="3"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-200 placeholder-slate-600 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Summary & Checkout */}
          <div className="space-y-6">
            <div className="p-6.5 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-900 shadow-xl space-y-6 sticky top-24">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-cyan-400" />
                Summary
              </h3>

              {activeService && (
                <div className="space-y-5">
                  {/* Service details */}
                  <div className="flex gap-4">
                    <img
                      src={activeService.image}
                      alt={activeService.serviceName}
                      className="w-16 h-16 rounded-2xl object-cover shadow"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-200 block leading-tight">
                        {activeService.serviceName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full inline-block">
                        {activeService.category}
                      </span>
                      <span className="text-xs text-slate-400 block pt-0.5">
                        Est. {activeService.duration}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900/60 pt-4 space-y-3.5 text-xs">
                    {selectedProvider && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Technician</span>
                        <span className="font-semibold text-slate-300 pr-0.5">
                          {selectedProvider.firstName} {selectedProvider.lastName}
                        </span>
                      </div>
                    )}
                    {bookingDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span className="font-semibold text-slate-300 pr-0.5">{bookingDate}</span>
                      </div>
                    )}
                    {bookingTime && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Scheduled Time</span>
                        <span className="font-semibold text-slate-300 pr-0.5">{bookingTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t border-slate-900/60 pt-4">
                      <span className="font-bold text-slate-400">Total Price</span>
                      <span className="font-black text-cyan-400 text-base">
                        Rs. {activeService.price}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!isAuthenticated || submitting}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-955 font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-97 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer text-sm"
                    >
                      {submitting ? 'Processing...' : 'Confirm Appointment'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {!isAuthenticated && (
                      <p className="text-[10px] text-center text-slate-500 leading-normal mt-3 pl-1 pr-1">
                        Sign in to activate this button and schedule.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
