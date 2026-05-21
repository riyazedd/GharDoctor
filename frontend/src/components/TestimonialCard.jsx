import { Star } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="p-6.5 rounded-3xl bg-slate-900/20 border border-slate-900 flex flex-col justify-between space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-transparent" />
          ))}
        </div>
        <p className="text-xs text-slate-400 italic leading-relaxed">
          "{testimonial.text}"
        </p>
      </div>
      <div className="pt-4 border-t border-slate-900/60">
        <span className="font-bold text-slate-200 text-sm block">{testimonial.name}</span>
        <span className="text-[10px] text-slate-500 font-semibold uppercase block tracking-wider mt-0.5">{testimonial.role}</span>
      </div>
    </div>
  );
}
