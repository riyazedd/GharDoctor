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
      className="group relative cursor-pointer overflow-hidden p-6 rounded-3xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 shadow-lg hover:shadow-cyan-500/5 hover:scale-102 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Background overlay accent */}
      <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-linear-to-tr ${category.color} opacity-5 group-hover:opacity-10 transition-opacity blur-md`} />
      
      <div className="space-y-4">
        <div className={`inline-flex p-3 rounded-2xl bg-linear-to-tr ${category.color} text-slate-950 shadow-md`}>
          <IconComponent className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors text-base">
            {category.categoryName}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {category.description}
          </p>
        </div>
      </div>
    </div>
  );
}
