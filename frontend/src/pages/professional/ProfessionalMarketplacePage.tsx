import React from 'react';
import { ProfessionalDiscovery } from '../../components/ProfessionalDiscovery';

export const ProfessionalMarketplacePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Marketplace Page Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 py-10 px-4 sm:px-6 lg:px-8 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Goa Construction Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Professional Marketplace
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Browse, filter, and compare all verified civil contractors, principal architects, structural consultants, and interior designers across Goa.
          </p>
        </div>
      </div>

      {/* Full Directory Listing (Displays all profiles without home page limit) */}
      <ProfessionalDiscovery isHomePageView={false} />
    </div>
  );
};

