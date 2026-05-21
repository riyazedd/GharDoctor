import { Star, Clock } from 'lucide-react';

export default function ServiceCard({ service, onBookNow }) {
  return (
    <div
      key={service._id}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-900/20 border border-slate-900 hover:border-slate-800/80 shadow-lg transition-all duration-300"
    >
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.serviceName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-955/80 backdrop-blur-md border border-slate-800/60 text-xs font-semibold text-cyan-400">
          {service.category}
        </div>
      </div>

      {/* Info block */}
      <div className="p-6 grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors text-base line-clamp-1">
              {service.serviceName}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-transparent" />
              <span>{service.rating || 4.5}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
            {service.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-600 pt-1.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{service.duration || '2-3 hours'}</span>
            </div>
          </div>
        </div>

        {/* Footer Booking actions */}
        <div className="pt-4 border-t border-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Price</span>
            <span className="text-lg font-black text-cyan-400">Rs. {service.price}</span>
          </div>
          <button
            onClick={() => onBookNow(service)}
            disabled={!service.isAvailable}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-md ${
              service.isAvailable
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/5 active:scale-95"
                : "bg-slate-850 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            {service.isAvailable ? 'Book Service' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
