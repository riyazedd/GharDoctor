import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProviderCard({ provider, isSelected, isAvailable, onSelect }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAvailable) {
      onSelect(provider);
      navigate(`/provider/${provider._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-4.5 rounded-2xl border flex items-center gap-4 transition-all ${
        !isAvailable
          ? "bg-slate-950/20 border-slate-900/40 opacity-40 cursor-not-allowed"
          : "cursor-pointer " + (isSelected
            ? "bg-cyan-500/5 border-cyan-500/40 shadow-md shadow-cyan-500/2"
            : "bg-slate-950/40 border-slate-850 hover:border-slate-800")
      }`}
    >
      {/* Avatar */}
      <img
        src={provider.avatar || 'https://via.placeholder.com/48'}
        alt={provider.firstName}
        className="w-12 h-12 rounded-full object-cover shadow-inner shrink-0"
      />

      {/* Details */}
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-slate-200 leading-tight">
            {provider.firstName} {provider.lastName}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            {provider.completedJobs || 0} jobs
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">{provider.experience || 5} yrs</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <div className="flex items-center text-amber-400 font-semibold gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-transparent" />
            <span>{provider.rating || 4.5}</span>
          </div>
          <span className="text-slate-600">({provider.reviews || 0})</span>
        </div>

        <span
          className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
            isAvailable
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {isAvailable ? 'Available Now' : 'Occupied'}
        </span>
      </div>
    </div>
  );
}
