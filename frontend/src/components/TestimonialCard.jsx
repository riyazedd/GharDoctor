import { Star } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="flex h-full flex-col justify-between gap-5 rounded-[24px] border border-[#e8d9ca] bg-[#fffdf9]/85 p-5">
      <div className="space-y-4">
        <div className="flex items-center gap-0.5 text-[#d9b46f]">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[#d9b46f] text-[#d9b46f]" />
          ))}
        </div>

        <p className="text-sm leading-relaxed text-[#5b4d49]">
          "{testimonial.text}"
        </p>
      </div>

      <div className="border-t border-[#eadcc7] pt-4">
        <span className="block text-sm font-black text-[#201a17]">{testimonial.name}</span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6b63]">{testimonial.role}</span>
      </div>
    </div>
  );
}
