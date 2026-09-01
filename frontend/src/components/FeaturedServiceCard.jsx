import { Star, Clock, ShieldCheck } from 'lucide-react';

export default function FeaturedServiceCard({ service, onBookNow }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#e8d9ca] bg-[#fffdf9]/90 transition-colors duration-200 hover:border-[#d7a37a]">
      <div className="relative h-52 overflow-hidden">
        <img
          src={service.image}
          alt={service.serviceName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d1714]/50 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#fffaf5]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#533b33] backdrop-blur-sm">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-black tracking-[-0.04em] text-[#201a17]">
              {service.serviceName}
            </h3>
            <div className="flex items-center gap-1 rounded-full bg-[#f8efe3] px-2 py-1 text-xs font-semibold text-[#8a5e24]">
              <Star className="h-3.5 w-3.5 fill-[#d9b46f] text-[#d9b46f]" />
              {service.rating}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#645b57]">
            {service.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-[#6d615d]">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#b86845]" />
              {service.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#7e8d68]" />
              Warranty
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#ebdfd2] pt-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6b63]">From</span>
            <span className="text-xl font-black text-[#b86845]">Rs. {service.price}</span>
          </div>
          <button
            onClick={() => onBookNow(service)}
            disabled={!service.isAvailable}
            className={`rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
              service.isAvailable
                ? 'bg-[#1f1a17] text-white hover:bg-[#3d312d]'
                : 'cursor-not-allowed bg-[#efe5dc] text-[#8b7d76]'
            }`}
          >
            {service.isAvailable ? 'Book now' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}
