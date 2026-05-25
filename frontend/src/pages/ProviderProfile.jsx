import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Briefcase, Award, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { providerAPI } from '../API';

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-slate-950 pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <div className="text-center py-20">
            <p className="text-red-400 text-lg font-semibold">{error || 'Provider not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    navigate('/booking', { state: { selectedProviderId: provider._id, shouldAutoSelectProvider: true } });
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        {/* Profile Header Card */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="shrink-0">
              <img
                src={provider.avatar || 'https://via.placeholder.com/150'}
                alt={provider.firstName}
                className="w-40 h-40 rounded-2xl object-cover border border-slate-700 shadow-lg"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
                  {provider.firstName} {provider.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span className="text-lg text-cyan-400 font-semibold">{provider.skill}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-100">{provider.rating?.toFixed(1) || '4.5'}</span>
                  <span className="text-slate-400">({provider.reviews || 0} reviews)</span>
                </div>

                <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">{provider.completedJobs || 0} Completed Jobs</span>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
                  provider.availability
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}>
                  <Clock className="w-5 h-5" style={{ color: provider.availability ? '#10b981' : '#64748b' }} />
                  <span className={`font-semibold ${provider.availability ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {provider.availability ? 'Available Now' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-2 text-slate-300">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-semibold">{provider.experience || 0}+ Years of Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                About
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Experienced {provider.skill} professional with {provider.experience || 0} years in the industry. Dedicated to providing high-quality service and customer satisfaction.
              </p>
            </div>

            {/* Skills & Expertise */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                Expertise
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">{provider.skill}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < 4 ? 'bg-cyan-400' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-cyan-400">{provider.experience || 0}</div>
                <div className="text-sm text-slate-400">Years Experience</div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-emerald-400">{provider.completedJobs || 0}</div>
                <div className="text-sm text-slate-400">Jobs Completed</div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center space-y-2">
                <div className="text-3xl font-bold text-amber-400">{provider.rating?.toFixed(1) || '4.5'}</div>
                <div className="text-sm text-slate-400">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & CTA */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Contact</h3>
              
              <div className="space-y-3">
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100 truncate">{provider.email}</span>
                </a>

                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  <Phone className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100">{provider.phone}</span>
                </a>
              </div>
            </div>

            {/* Booking CTA */}
            <button
              onClick={handleBooking}
              disabled={!provider.availability}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                provider.availability
                  ? 'bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-95'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {provider.availability ? 'Book This Provider' : 'Currently Unavailable'}
            </button>

            {/* Verification Badge */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Verified Professional</div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Identity Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
