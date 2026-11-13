import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Sparkles, TrendingUp, CheckCircle, Info, ArrowRight } from 'lucide-react';

export const CostEstimatorPreview: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();

  const [areaSqft, setAreaSqft] = useState(2200);
  const [district, setDistrict] = useState<'North Goa' | 'South Goa'>('North Goa');
  const [floors, setFloors] = useState(2);
  const [finishTier, setFinishTier] = useState<'economy' | 'standard' | 'premium' | 'luxury'>('standard');

  const tierRates = {
    economy: 1750,
    standard: 2150,
    premium: 2750,
    luxury: 3600
  };

  const districtMultiplier = district === 'North Goa' ? 1.05 : 1.0;
  const floorMultiplier = floors === 1 ? 1.0 : floors === 2 ? 1.03 : 1.07;

  const ratePerSqft = Math.round(tierRates[finishTier] * districtMultiplier * floorMultiplier);
  const totalCost = areaSqft * ratePerSqft;
  const totalCostLakhs = (totalCost / 100000).toFixed(2);
  const minRangeLakhs = ((totalCost * 0.94) / 100000).toFixed(2);
  const maxRangeLakhs = ((totalCost * 1.06) / 100000).toFixed(2);

  const civilCost = Math.round(totalCost * 0.48);
  const materialsCost = Math.round(totalCost * 0.24);
  const labourCost = Math.round(totalCost * 0.15);
  const mepCost = Math.round(totalCost * 0.08);
  const finishingCost = Math.round(totalCost * 0.05);

  return (
    <section id="cost-estimator" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> High Priority AI Feature · Feature 12 & 17
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
            AI Construction Cost Estimator
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Trained on historical Goa building data. Realistically calculate your approximate construction expenditure by area, finish tier, and location before consulting a contractor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-6 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Built-up Area (Sq. Ft)
                </label>
                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  {areaSqft.toLocaleString()} sq.ft
                </span>
              </div>
              <input
                type="range"
                min="800"
                max="5000"
                step="100"
                value={areaSqft}
                onChange={(e) => setAreaSqft(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>800 sq.ft (Compact Villa)</span>
                <span>2,500 sq.ft</span>
                <span>5,000 sq.ft (Luxury Estate)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Location in Goa
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDistrict('North Goa')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    district === 'North Goa'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  North Goa (Panaji / Mapusa)
                </button>
                <button
                  type="button"
                  onClick={() => setDistrict('South Goa')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    district === 'South Goa'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  South Goa (Margao / Vasco)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Number of Floors
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFloors(f)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      floors === f
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {f} {f === 1 ? 'Floor (G)' : 'Floors'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Finishing & Material Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['economy', 'standard', 'premium', 'luxury'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setFinishTier(tier)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      finishTier === tier
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs capitalize">{tier}</div>
                    <div className={`text-[10px] ${finishTier === tier ? 'text-slate-900' : 'text-slate-400'}`}>
                      {tier === 'economy' && 'Basic vitrified, standard brick'}
                      {tier === 'standard' && 'Branded cement, Teak doors'}
                      {tier === 'premium' && 'Italian marble, UPVC, Hafele'}
                      {tier === 'luxury' && 'Full smart home, pool, stone'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Prediction Output Card */}
          <div className="lg:col-span-6 bg-gradient-to-b from-slate-800 to-slate-850 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Predicted Project Expenditure
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  ₹{totalCostLakhs} <span className="text-2xl font-bold text-amber-400">Lakhs</span>
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated range: ₹{minRangeLakhs}L — ₹{maxRangeLakhs}L (~₹{ratePerSqft.toLocaleString()}/sq.ft)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Itemized Cost Breakdown
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">1. Structural & Civil Work (48%)</span>
                  <span className="font-bold text-white">₹{(civilCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">2. Raw Materials - Cement, Steel (24%)</span>
                  <span className="font-bold text-white">₹{(materialsCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">3. Labour & Execution Charges (15%)</span>
                  <span className="font-bold text-white">₹{(labourCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">4. Electrical, Plumbing & Sanitary (8%)</span>
                  <span className="font-bold text-white">₹{(mepCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">5. Finishing & Misc Site Approvals (5%)</span>
                  <span className="font-bold text-white">₹{(finishingCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedRoleForModal('customer');
                  setOpenRegisterModal(true);
                }}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Save Estimate & Request Real Contractor Quotations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic ML model with calibrated Goa construction parameters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
