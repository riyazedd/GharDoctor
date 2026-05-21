import { Star, Clock, ShieldCheck } from 'lucide-react';

export default function FeaturedServiceCard({ service, onBookNow }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 shadow-xl transition-all duration-300">
      {/* Image banner */}
      <div className="relative h-56 overflow-hidden">
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

      {/* Body */}
      <div className="p-6 grow flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-lg group-hover:text-cyan-400 transition-colors">
              {service.serviceName}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-transparent" />
              <span>{service.rating}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {service.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{service.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Service Warranty</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Starting from</span>
            <span className="text-xl font-black text-cyan-400">Rs. {service.price}</span>
          </div>
          <button
            onClick={() => onBookNow(service)}
            disabled={!service.isAvailable}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-md ${
              service.isAvailable
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/5 active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            {service.isAvailable ? 'Book Now' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
