export default function QualityCard({ item }) {
  const ItemIcon = item.icon;

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-900/60">
      <div className={`p-3 rounded-xl shrink-0 self-start ${item.color}`}>
        <ItemIcon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-normal">{item.desc}</p>
      </div>
    </div>
  );
}
