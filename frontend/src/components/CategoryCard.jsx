import { Sparkles, Droplet, Zap, Paintbrush, Flower, Wrench, Hammer, ShieldAlert } from 'lucide-react';

const iconMap = {
  Sparkles,
  Droplet,
  Zap,
  Paintbrush,
  Flower,
  Wrench,
  Hammer,
  ShieldAlert
};

export default function CategoryCard({ category, onSelect }) {
  const IconComponent = iconMap[category.icon] || Sparkles;

  return (
    <div
      onClick={() => onSelect(category.categoryName)}
      className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-[#e8d9ca] p-5 transition-colors duration-200 hover:border-[#d7a37a]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f7efe5] text-[#b86845]`}>
          <IconComponent className="h-5 w-5 stroke-[2.3]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6b63]">Service</span>
      </div>

      <div>
        <h3 className="text-lg font-black tracking-[-0.04em] text-[#201a17] transition-colors group-hover:text-[#b86845]">
          {category.categoryName}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#645b57]">
          {category.description}
        </p>
      </div>
    </div>
  );
}
