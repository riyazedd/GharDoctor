import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Search, Users, Wrench } from 'lucide-react';
import { providerAPI } from '../API';

export default function ServiceProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await providerAPI.getAllProviders();
        setProviders(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load service providers.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
    window.scrollTo(0, 0);
  }, []);

  const filteredProviders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return providers;

    return providers.filter((provider) =>
      `${provider.firstName || ''} ${provider.lastName || ''}`.toLowerCase().includes(query)
      || provider.skill?.toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f7f1ea] pt-8">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-[#eadcc7] bg-[#fffdfb]/80 p-6 shadow-[0_14px_30px_rgba(68,40,24,0.03)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a5a3c]">
                <Users className="h-4 w-4" />
                Trusted professionals
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#201a17] sm:text-5xl">Service providers</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#655d5a]">Browse all professionals and view their skills, experience, and availability.</p>
            </div>

            <div className="w-full max-w-md">
              <label htmlFor="provider-search-input" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">Search providers</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d665f]" />
                <input
                  id="provider-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Name or service skill..."
                  className="w-full rounded-full border border-[#eadcc7] bg-[#fffdfb] py-3 pl-11 pr-4 text-sm text-[#2b241f] placeholder-[#7b6e68] focus:border-[#d38b66] focus:outline-none focus:ring-2 focus:ring-[#f0d4b5]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-12 text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#d58c63] border-t-transparent" />
              <p className="mt-4 text-sm text-[#655d5a]">Loading service providers...</p>
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-dashed border-[#e2c8b2] bg-[#fffdfb]/80 p-12 text-center text-sm text-[#a24939]">{error}</div>
          ) : filteredProviders.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <article key={provider._id} className="flex flex-col rounded-[26px] border border-[#eadcc7] bg-[#fffdfb] p-5 shadow-[0_14px_30px_rgba(68,40,24,0.03)]">
                  <div className="flex items-start gap-4">
                    <img
                      src={provider.avatar || 'https://via.placeholder.com/96'}
                      alt={`${provider.firstName || 'Service'} ${provider.lastName || 'provider'}`}
                      className="h-16 w-16 rounded-2xl border border-[#eadcc7] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-black text-[#201a17]">{provider.firstName} {provider.lastName}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#a75d3b]"><Wrench className="h-3.5 w-3.5" />{provider.skill || 'Home services'}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3 text-xs text-[#655d5a]">
                    <span className="flex items-center gap-1.5 rounded-full bg-[#f8f1ea] px-3 py-2"><BriefcaseBusiness className="h-3.5 w-3.5" />{provider.experience || 0} yrs experience</span>
                    <span className={`rounded-full px-3 py-2 font-semibold ${provider.availability ? 'bg-[#e8f2e8] text-[#3d6a4b]' : 'bg-[#f1ece8] text-[#7c6b63]'}`}>{provider.availability ? 'Available' : 'Unavailable'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/provider/${provider._id}`)}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-[#e7ba9a] bg-[#f9efe6] px-4 py-2.5 text-sm font-bold text-[#7d3d22] transition-colors hover:bg-[#f4e4d5]"
                  >
                    View profile <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#e2c8b2] bg-[#fffdfb]/80 p-12 text-center">
              <p className="text-base font-semibold text-[#201a17]">No service providers found</p>
              <p className="mt-2 text-sm text-[#655d5a]">Try a different name or service skill.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
