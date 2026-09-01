import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, FileText, AlertCircle, Sparkles, User, Heart, ArrowRight
} from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import BookingSuccess from '../components/BookingSuccess';
import { serviceAPI, bookingAPI } from '../API';

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
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getAllServices();
        setServices(response.data);
        if (!activeService && response.data.length > 0) {
          setActiveService(response.data[0]);
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

  // Fetch available time slots when date or provider changes
  useEffect(() => {
    if (!selectedProvider || !bookingDate) {
      setAvailableTimeSlots([]);
      setBookingTime(''); // Clear selected time
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const response = await bookingAPI.getAvailableTimeSlots(
          selectedProvider._id,
          bookingDate
        );
        setAvailableTimeSlots(response.data.availableSlots);
        // Clear previously selected time if it's no longer available
        if (bookingTime && !response.data.availableSlots.includes(bookingTime)) {
          setBookingTime('');
        }
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setAvailableTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedProvider, bookingDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!isAuthenticated) {
      setError('You must be logged in to schedule a booking.');
      setSubmitting(false);
      return;
    }

    if (!activeService) {
      setError('Please select a service.');
      setSubmitting(false);
      return;
    }

    if (!selectedProvider) {
      setError('Please select a service provider.');
      setSubmitting(false);
      return;
    }

    if (!bookingDate || !bookingTime) {
      setError('Please choose a valid date and time slot.');
      setSubmitting(false);
      return;
    }

    if (!serviceAddress.trim()) {
      setError('Please provide a service address.');
      setSubmitting(false);
      return;
    }

    try {
      // Create booking object
      const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const newBooking = {
        bookingId,
        userId: user._id,
        serviceId: activeService._id,
        serviceProviderId: selectedProvider._id,
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
      };

      // Save to database
      const response = await bookingAPI.createBooking(newBooking);
      setBookingDetails(response.data);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  const steps = [
    { id: 'service', number: '01', label: 'Service', icon: Sparkles, done: !!activeService },
    { id: 'provider', number: '02', label: 'Professional', icon: User, done: !!selectedProvider },
    { id: 'schedule', number: '03', label: 'Schedule', icon: Calendar, done: !!(bookingDate && bookingTime) },
    { id: 'confirm', number: '04', label: 'Confirm', icon: Heart, done: false },
  ];

  const currentStepIndex = !activeService ? 0 : !selectedProvider ? 1 : !(bookingDate && bookingTime) ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#f7f1ea] pt-8">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a5a3c]">Booking</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#201a17] sm:text-5xl">
            Schedule your appointment
          </h1>
        </div>

        {!isAuthenticated && (
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-[26px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:flex-row">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-[#e8cfb2] bg-[#f9efe6] p-2.5 text-[#8a4d2b]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#201a17]">Authentication required</h3>
                <p className="mt-1 text-xs text-[#655d5a]">
                  Sign in to secure your preferred appointment slot and track updates.
                </p>
              </div>
            </div>

            <div className="flex w-full gap-3 sm:w-auto">
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-full bg-[#d77a4a] px-4 py-2.5 text-xs font-bold text-white sm:w-auto"
              >
                Sign in now
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full rounded-full border border-[#e6d4c3] bg-[#fffdfb] px-4 py-2.5 text-xs font-bold text-[#5d4d49] sm:w-auto"
              >
                Sign up
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isComplete = step.done && index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={`rounded-[24px] border p-4 ${
                  isActive
                    ? 'border-[#d7b091] bg-[#f9efe7]'
                    : isComplete
                    ? 'border-[#dfe5d5] bg-[#f8f6f4]'
                    : 'border-[#eadcc7] bg-[#fffdfb]/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-black ${
                      isActive
                        ? 'bg-[#201a17] text-[#fffdfb]'
                        : isComplete
                        ? 'bg-[#7e8d68] text-white'
                        : 'bg-[#f1e6dc] text-[#7d6a62]'
                    }`}
                  >
                    {step.number}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#8a4d2b]' : 'text-[#7d6a62]'}`} />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                        {step.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#4e4643]">
                      {index === 0
                        ? activeService ? activeService.serviceName : 'Select a service'
                        : index === 1
                        ? selectedProvider ? `${selectedProvider.firstName} ${selectedProvider.lastName}` : 'Choose a professional'
                        : index === 2
                        ? bookingDate && bookingTime ? `${bookingDate} • ${bookingTime}` : 'Pick a time'
                        : 'Review and confirm'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleBookingSubmit} className="grid gap-10 lg:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-8">
            {error && (
              <div className="flex items-center gap-3 rounded-[22px] border border-[#e6b7ad] bg-[#f9ece9] p-5 text-sm font-medium text-[#8a4d2b]">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-[#efe0d0] pb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#201a17] text-[11px] font-black text-[#fffdfb]">
                  01
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Step one</p>
                  <h2 className="text-xl font-black tracking-[-0.04em] text-[#201a17]">Select a service</h2>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                  Requested service type
                </label>
                <select
                  value={activeService?._id || ''}
                  onChange={(e) => {
                    const selected = services.find(s => s._id === e.target.value);
                    setActiveService(selected);
                  }}
                  className="w-full rounded-[18px] border border-[#e7d8c8] bg-[#fffdfb] px-4 py-3 text-sm text-[#2b241f] outline-none transition-colors focus:border-[#d38b66]"
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

            <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-[#efe0d0] pb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#201a17] text-[11px] font-black text-[#fffdfb]">
                  02
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Step two</p>
                  <h2 className="text-xl font-black tracking-[-0.04em] text-[#201a17]">Choose a professional</h2>
                </div>
              </div>

              {providers.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-[#655d5a]">Available experts for {activeService?.category}:</p>
                  <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="rounded-[22px] border border-dashed border-[#e6d4c3] bg-[#faf5f0] p-8 text-center text-sm text-[#655d5a]">
                  {activeService ? 'No professionals are available for this service yet.' : 'Select a service first to view available professionals.'}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-[#efe0d0] pb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#201a17] text-[11px] font-black text-[#fffdfb]">
                  03
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Step three</p>
                  <h2 className="text-xl font-black tracking-[-0.04em] text-[#201a17]">Set the schedule</h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                    Appointment date
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full rounded-[18px] border border-[#e7d8c8] bg-[#fffdfb] py-3 pl-10 pr-4 text-sm text-[#2b241f] outline-none transition-colors focus:border-[#d38b66]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                    Time slot
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <select
                      required
                      disabled={!bookingDate || !selectedProvider || loadingSlots}
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full rounded-[18px] border border-[#e7d8c8] bg-[#fffdfb] py-3 pl-10 pr-4 text-sm text-[#2b241f] outline-none transition-colors focus:border-[#d38b66] disabled:opacity-60"
                    >
                      <option value="">
                        {loadingSlots
                          ? 'Loading available slots...'
                          : !bookingDate
                          ? 'Select a date first'
                          : !selectedProvider
                          ? 'Select a provider first'
                          : availableTimeSlots.length === 0
                          ? 'No available slots'
                          : 'Select a time slot'}
                      </option>
                      {!loadingSlots && availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot === '09:00 AM'
                            ? '09:00 AM - 11:00 AM (Morning)'
                            : slot === '11:30 AM'
                            ? '11:30 AM - 01:30 PM (Mid-day)'
                            : slot === '02:00 PM'
                            ? '02:00 PM - 04:00 PM (Afternoon)'
                            : slot === '04:30 PM'
                            ? '04:30 PM - 06:30 PM (Evening)'
                            : slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                    Service address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address, City, Kathmandu"
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      className="w-full rounded-[18px] border border-[#e7d8c8] bg-[#fffdfb] py-3 pl-10 pr-4 text-sm text-[#2b241f] outline-none transition-colors focus:border-[#d38b66]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                  Special instructions (optional)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-3 text-[#7d665f]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <textarea
                    rows="3"
                    placeholder="Call on arrival, gate code, or repair notes"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full resize-none rounded-[18px] border border-[#e7d8c8] bg-[#fffdfb] py-3 pl-10 pr-4 text-sm text-[#2b241f] outline-none transition-colors focus:border-[#d38b66]"
                  />
                </div>
              </div>
              </div>
            </div>
          </div>

          <aside className="lg:pt-2">
            <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 sm:p-8 lg:sticky lg:top-24">
              <div className="mb-6 flex items-center gap-3 border-b border-[#efe0d0] pb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#201a17] text-[11px] font-black text-[#fffdfb]">
                  04
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Step four</p>
                  <h2 className="text-xl font-black tracking-[-0.04em] text-[#201a17]">Confirm</h2>
                </div>
              </div>

              {activeService && (
                <div className="space-y-6">
                  <div className="flex gap-3 border-b border-[#efe0d0] pb-4">
                    <img src={activeService.image} alt={activeService.serviceName} className="h-16 w-16 rounded-[18px] object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#201a17]">{activeService.serviceName}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">
                        {activeService.category}
                      </p>
                      <p className="mt-1 text-xs text-[#655d5a]">Est. {activeService.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    {selectedProvider && (
                      <div className="flex items-center justify-between gap-4 border-b border-[#efe0d0] pb-4">
                        <span className="text-[#655d5a]">Professional</span>
                        <span className="text-right font-semibold text-[#201a17]">
                          {selectedProvider.firstName} {selectedProvider.lastName}
                        </span>
                      </div>
                    )}
                    {bookingDate && (
                      <div className="flex items-center justify-between gap-4 border-b border-[#efe0d0] pb-4">
                        <span className="text-[#655d5a]">Date</span>
                        <span className="font-semibold text-[#201a17]">{bookingDate}</span>
                      </div>
                    )}
                    {bookingTime && (
                      <div className="flex items-center justify-between gap-4 border-b border-[#efe0d0] pb-4">
                        <span className="text-[#655d5a]">Time</span>
                        <span className="font-semibold text-[#201a17]">{bookingTime}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7d6a62]">Total</span>
                      <span className="text-3xl font-black tracking-[-0.05em] text-[#b86845]">Rs. {activeService.price}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isAuthenticated || submitting}
                    className="mt-8 w-full rounded-full bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] px-6 py-4 text-sm font-bold text-white transition-all duration-200 shadow-[0_12px_24px_rgba(201,109,66,0.15)] disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-105"
                  >
                    {submitting ? 'Processing...' : 'Confirm appointment'}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-[#7d6a62]">
                      Sign in to complete booking
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
