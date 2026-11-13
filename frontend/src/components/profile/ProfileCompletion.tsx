import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Props {
  percentage: number;
  sections?: { name: string; completed: boolean; link?: string }[];
}

export const ProfileCompletion: React.FC<Props> = ({ percentage, sections = [] }) => {
  const getColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Profile Strength
        </span>
        <span className="text-sm font-black text-slate-900">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checkpoints */}
      {sections.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Key Sections
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sections.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                {s.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span className={s.completed ? 'font-medium text-slate-800' : 'text-slate-400'}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {percentage < 100 && (
        <div className="mt-3 p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Complete all sections to rank higher in Goa client searches.</span>
        </div>
      )}
    </div>
  );
};

