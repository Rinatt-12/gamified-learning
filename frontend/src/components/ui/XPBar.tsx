interface XPBarProps {
  current: number;
  needed: number;
  percent: number;
  level: number;
}

export default function XPBar({ current, needed, percent, level }: XPBarProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm text-slate-500">Деңгей</p>
            <p className="text-2xl font-bold text-slate-900">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">XP</p>
          <p className="text-xl font-bold text-yellow-600">
            {current} / {needed}
          </p>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">{percent}% келесі деңгейге</p>
    </div>
  );
}