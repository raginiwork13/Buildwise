import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Sparkles, MapPin, Building, ArrowRight, Calculator } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();
  const [district, setDistrict] = useState('North Goa');
  const [projectType, setProjectType] = useState('new_residential');
  const [areaSqft, setAreaSqft] = useState(2000);

  const baseRatePerSqft = district === 'North Goa' ? 2200 : 2050;
  const quickEstimateLakhs = ((areaSqft * baseRatePerSqft) / 100000).toFixed(1);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-amber-400 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Goa's #1 AI Construction Marketplace · Problem Statement 6</span>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mt-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Constructing in Goa,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Made Intelligent & Transparent
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Connect directly with verified local contractors, architects, and suppliers. Leverage AI to forecast accurate budgets, translate requirements into BOQ specifications, and audit contractor quotations side-by-side.
          </p>
        </div>

        <div className="mt-10 max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Quick Project Matcher & Instant Goa Cost Guide
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3">
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> Location in Goa
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="North Goa" className="bg-slate-900 text-white">North Goa (Panaji, Mapusa, Porvorim)</option>
                <option value="South Goa" className="bg-slate-900 text-white">South Goa (Margao, Vasco, Ponda)</option>
              </select>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3">
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-amber-400" /> Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="new_residential" className="bg-slate-900 text-white">New Independent Villa</option>
                <option value="renovation" className="bg-slate-900 text-white">Heritage / Villa Renovation</option>
                <option value="commercial" className="bg-slate-900 text-white">Commercial / Boutique Resort</option>
                <option value="interior_design" className="bg-slate-900 text-white">Full Interior Design</option>
              </select>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-amber-400" /> Built-up Area
                </label>
                <span className="text-xs font-bold text-amber-300">{areaSqft.toLocaleString()} sq.ft</span>
              </div>
              <input
                type="range"
                min="800"
                max="6000"
                step="100"
                value={areaSqft}
                onChange={(e) => setAreaSqft(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-xs text-slate-400 block">Estimated Benchmark Budget</span>
                <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
                  ₹{quickEstimateLakhs} Lakhs
                  <span className="text-xs text-slate-400 font-normal ml-1">(~₹{baseRatePerSqft}/sq.ft standard)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="#cost-estimator"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                Detailed Breakdown
              </a>
              <button
                onClick={() => {
                  setSelectedRoleForModal('customer');
                  setOpenRegisterModal(true);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Find Contractors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-white">250+</div>
            <div className="text-xs text-slate-400 mt-0.5">Verified Goa Contractors</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-amber-400">₹18.5 Cr+</div>
            <div className="text-xs text-slate-400 mt-0.5">Construction Bids Managed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-emerald-400">98.4%</div>
            <div className="text-xs text-slate-400 mt-0.5">Verified Milestone Delivery</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="text-2xl font-black text-blue-400">0%</div>
            <div className="text-xs text-slate-400 mt-0.5">Cold Calls · 100% Direct</div>
          </div>
        </div>
      </div>
    </section>
  );
};
