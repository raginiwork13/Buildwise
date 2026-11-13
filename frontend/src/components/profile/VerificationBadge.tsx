import React from 'react';
import type { VerificationStatus } from '../../types/profile';
import { ShieldCheck, Clock, AlertCircle } from 'lucide-react';

interface Props {
  status: VerificationStatus;
  showPendingNotice?: boolean;
}

export const VerificationBadge: React.FC<Props> = ({ status, showPendingNotice = false }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        <span>Verified Professional</span>
      </span>
    );
  }

  if (status === 'pending' || status === 'under_review') {
    return showPendingNotice ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Verification Under Review</span>
      </span>
    ) : null;
  }

  if (status === 'rejected' && showPendingNotice) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
        <span>Verification Rejected</span>
      </span>
    );
  }

  return null;
};

