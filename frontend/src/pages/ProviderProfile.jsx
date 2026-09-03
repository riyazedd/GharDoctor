import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, Mail, Briefcase, Award, Clock,
  CheckCircle, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { providerAPI, serviceAPI } from '../API';
import Rating from '../components/Rating';
import StarRatingInput from '../components/StarRatingInput';

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchingService, setMatchingService] = useState(null);
  const [serviceLookupLoading, setServiceLookupLoading] = useState(true);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const isAuthenticated = Boolean(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const response = await providerAPI.getProviderById(id);
        setProvider(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching provider details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  useEffect(() => {
    const fetchMatchingService = async () => {
      if (!provider?.skill) {
        setMatchingService(null);
        setServiceLookupLoading(false);
        return;
      }

      setServiceLookupLoading(true);
      try {
        const response = await serviceAPI.getAllServices();
        const matched = response.data.find(
          (service) => service.category?.toLowerCase() === provider.skill.toLowerCase()
        );
        setMatchingService(matched || null);
      } catch (err) {
        console.error('Error fetching matching service:', err);
        setMatchingService(null);
      } finally {
        setServiceLookupLoading(false);
      }
    };

    fetchMatchingService();
  }, [provider]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ea] pt-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d58c63] border-t-transparent" />
          <p className="mt-4 text-sm text-[#655d5a]">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-[#f7f1ea] pt-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8a4d2b]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-12 text-center">
            <p className="text-lg font-bold text-[#a24939]">{error || 'Provider not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate('/booking', {
      state: {
        service: matchingService || undefined,
        selectedProviderId: provider._id,
        shouldAutoSelectProvider: true,
      },
    });
  };

  const handleRatingSubmit = async (event) => {
    event.preventDefault();

    setRatingError('');
    setRatingMessage('');
    setSubmittingRating(true);

    try {
      const response = await providerAPI.rateProvider(provider._id, { rating: ratingValue });
      setProvider(response.data.provider);
      setRatingMessage(response.data.message || 'Rating submitted successfully');
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1ea] pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8a4d2b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <img
                  src={provider.avatar || 'https://via.placeholder.com/150'}
                  alt={provider.firstName}
                  className="h-32 w-32 rounded-[24px] border border-[#eadcc7] object-cover md:h-36 md:w-36"
                />

                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a5a3c]">Professional</p>
                    <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#201a17]">
                      {provider.firstName} {provider.lastName}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-[#eadcc7] bg-[#f8f1ea] px-3 py-1.5 text-sm font-semibold text-[#8a4d2b]">
                      <Briefcase className="h-4 w-4" />
                      {provider.skill}
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[#eadcc7] bg-[#f8f1ea] px-3 py-1.5 text-sm font-semibold text-[#8a4d2b]">
                      <Star className="h-4 w-4 fill-[#d9b46f] text-[#d9b46f]" />
                      {(provider.rating || 0).toFixed(1)} rating
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] border border-[#eadcc7] bg-[#f9f3ed] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Experience</p>
                      <p className="mt-2 text-xl font-black text-[#201a17]">{provider.experience || 0}+ yrs</p>
                    </div>
                    <div className="rounded-[18px] border border-[#eadcc7] bg-[#f9f3ed] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Completed</p>
                      <p className="mt-2 text-xl font-black text-[#201a17]">{provider.completedJobs || 0}</p>
                    </div>
                    <div className="rounded-[18px] border border-[#eadcc7] bg-[#f9f3ed] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Availability</p>
                      <p className={`mt-2 text-sm font-bold ${provider.availability ? 'text-[#2f6d49]' : 'text-[#7c6b63]'}`}>
                        {provider.availability ? 'Available now' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
              <div className="border-b border-[#efe0d0] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Overview</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#201a17]">About this specialist</h2>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#4d4541]">
                <p>
                  Experienced {provider.skill} professional with {provider.experience || 0} years in the trade. Dedicated to reliable home service, careful workmanship, and clear communication from booking to completion.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="rounded-full border border-[#eadcc7] bg-[#f9f3ed] px-3 py-1.5 text-xs font-semibold text-[#7d6a62]">
                    Background checked
                  </span>
                  <span className="rounded-full border border-[#eadcc7] bg-[#f9f3ed] px-3 py-1.5 text-xs font-semibold text-[#7d6a62]">
                    Verified professional
                  </span>
                  <span className="rounded-full border border-[#eadcc7] bg-[#f9f3ed] px-3 py-1.5 text-xs font-semibold text-[#7d6a62]">
                    Local service expert
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
              <div className="border-b border-[#efe0d0] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Reviews</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#201a17]">Customer feedback</h2>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[#eadcc7] bg-[#f8f1ea] px-3 py-2 text-sm font-semibold text-[#8a4d2b]">
                  <Star className="h-4 w-4 fill-[#d9b46f] text-[#d9b46f]" />
                  {provider.rating?.toFixed(1) || '4.5'} average
                </div>
                <div className="text-sm text-[#655d5a]">{provider.reviews || 0} verified reviews</div>
              </div>

              <div className="mt-5 rounded-[20px] border border-[#efe0d0] bg-[#faf5f0] p-4">
                <Rating
                  value={provider.rating || 0}
                  text={`${(provider.rating || 0).toFixed(1)} average from ${provider.reviews || 0} reviews`}
                />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Booking</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#201a17]">Book this specialist</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-[18px] border border-[#efe0d0] bg-[#faf5f0] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Specialization</p>
                  <p className="mt-2 text-base font-bold text-[#201a17]">{provider.skill}</p>
                </div>

                <div className="rounded-[18px] border border-[#efe0d0] bg-[#faf5f0] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Availability</p>
                  <p className={`mt-2 text-base font-bold ${provider.availability ? 'text-[#2f6d49]' : 'text-[#7c6b63]'}`}>
                    {provider.availability ? 'Available for new bookings' : 'Currently unavailable'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!provider.availability || serviceLookupLoading}
                className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-bold text-white ${
                  provider.availability && !serviceLookupLoading
                    ? 'bg-gradient-to-r from-[#d77a4a] to-[#d9b46f]'
                    : 'cursor-not-allowed bg-[#efe6de] text-[#8d7c75]'
                }`}
              >
                {serviceLookupLoading ? 'Preparing booking...' : !provider.availability ? 'Unavailable' : isAuthenticated ? 'Book now' : 'Sign in to book'}
              </button>
            </div>

            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Contact</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#201a17]">Reach out</h2>

              <div className="mt-5 space-y-3 text-sm text-[#4d4541]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#b86845]" />
                  <span>{provider.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#b86845]" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#b86845]" />
                  <span>{provider.address || 'Location available on request'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#201a17]">
                <ShieldCheck className="h-4 w-4 text-[#3d6a4b]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Verified</p>
              </div>
              <p className="mt-3 text-sm text-[#4d4541]">Identity verified and trusted for home service bookings.</p>
            </div>

            <div className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 sm:p-6">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">Rate this specialist</p>
                <h3 className="text-xl font-black tracking-[-0.04em] text-[#201a17]">Your review</h3>
              </div>

              <form onSubmit={handleRatingSubmit} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <StarRatingInput rating={ratingValue} setRating={setRatingValue} />
                  <p className="text-xs text-[#655d5a]">Selected rating: {ratingValue}/5</p>
                </div>

                {ratingError && (
                  <div className="rounded-[16px] border border-[#e6b7ad] bg-[#f9ece9] p-3 text-sm text-[#8a4d2b]">
                    {ratingError}
                  </div>
                )}

                {ratingMessage && (
                  <div className="rounded-[16px] border border-[#b9d4b0] bg-[#edf6ee] p-3 text-sm text-[#2b5d3f]">
                    {ratingMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingRating}
                  className="w-full rounded-full bg-[#201a17] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingRating ? 'Submitting...' : 'Submit rating'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
