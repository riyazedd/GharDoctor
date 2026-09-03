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
      className={`relative flex items-center gap-3 rounded-[22px] border p-3 transition-all ${
        !isAvailable
          ? 'cursor-not-allowed border-[#e8d8ca] bg-[#f7f2ed] opacity-60'
          : 'cursor-pointer ' + (isSelected
            ? 'border-[#d7b091] bg-[#f9efe7] shadow-[0_10px_20px_rgba(68,40,24,0.04)]'
            : 'border-[#e8d8ca] bg-[#fffdfb] hover:border-[#d8bf9d]')
      }`}
    >
      <img
        src={provider.avatar || 'https://via.placeholder.com/48'}
        alt={provider.firstName}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#201a17]">
              {provider.firstName} {provider.lastName}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6c605b]">
              <span>{provider.experience || 5} yrs</span>
              <span className="h-1 w-1 rounded-full bg-[#cab7a9]" />
              <span>{provider.completedJobs || 0} jobs</span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[#f7efe5] px-2 py-1 text-[10px] font-bold text-[#8a5a3c]">
            <Star className="h-3 w-3 fill-[#d9b46f] text-[#d9b46f]" />
            {provider.rating}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
              isAvailable
                ? 'bg-[#e8f2e8] text-[#3d6a4b]'
                : 'bg-[#f1ece8] text-[#7c6b63]'
            }`}
          >
            {isAvailable ? 'Available now' : 'Occupied'}
          </span>

          {isSelected && (
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a4d2b]">
              Selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
