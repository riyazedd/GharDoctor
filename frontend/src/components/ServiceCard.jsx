import { Star, Clock, CheckCircle2 } from 'lucide-react';

export default function ServiceCard({ service, onBookNow }) {
  return (
    <article className="group flex flex-col gap-0 border-b border-[#f0e5d9] py-6 sm:flex-row sm:gap-6 sm:py-7 sm:px-0">
      <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-56 shrink-0 rounded-[20px]">
        <img
          src={service.image}
          alt={service.serviceName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 rounded-full bg-[#fffaf3] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a3c]">
          {service.category}
        </div>
      </div>

      <div className="flex w-full flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-black leading-tight tracking-[-0.05em] text-[#201a17]">
              {service.serviceName}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5f524f]">
              {service.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-[#927e6d]">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">{service.duration || '2-3 hours'}</span>
            </div>
            <span className="h-4 w-px bg-[#cab7a9]"></span>
            <div className="flex items-center gap-1.5 text-[#a67d51]">
              <Star className="h-3.5 w-3.5 fill-[#d9b46f] text-[#d9b46f] sm:h-4 sm:w-4" />
              <span className="font-medium">{service.rating || 4.8}</span>
            </div>
            <span className="h-4 w-px bg-[#cab7a9]"></span>
            <span className={`font-medium ${service.isAvailable ? 'text-[#3d6a4b]' : 'text-[#7c6b63]'}`}>
              {service.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:mt-auto sm:flex-row sm:items-end sm:justify-between sm:pt-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#866d63]">Starting from</span>
            <div className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#b86845]">Rs. {service.price}</div>
          </div>

          <button
            onClick={() => onBookNow(service)}
            disabled={!service.isAvailable}
            className={`rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 w-full sm:w-auto ${
              service.isAvailable
                ? 'bg-[#d77a4a] text-white shadow-[0_8px_16px_rgba(201,109,66,0.12)] hover:bg-[#c96838]'
                : 'cursor-not-allowed bg-[#efe6de] text-[#a2938c]'
            }`}
          >
            {service.isAvailable ? 'Book now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
}
