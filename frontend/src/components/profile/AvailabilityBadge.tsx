import React from 'react';
import type { AvailabilityStatus } from '../../types/profile';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Props {
  status: AvailabilityStatus;
  size?: 'sm' | 'md';
}

export const AvailabilityBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = {
    available: {
      label: 'Available for New Projects',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500'
    },
    limited_availability: {
      label: 'Limited Availability',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500'
    },
    unavailable: {
      label: 'Currently Booked Out',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: XCircle,
      dot: 'bg-slate-400'
    }
  };

  const current = config[status] || config.available;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${padding} ${current.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      <span>{current.label}</span>
    </span>
  );
};

