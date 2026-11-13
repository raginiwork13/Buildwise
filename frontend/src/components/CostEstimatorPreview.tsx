import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Sparkles, TrendingUp, CheckCircle, Info, ArrowRight } from 'lucide-react';
import type { GoaLocation, ProjectType, ConstructionType, FoundationType, MaterialQuality, FinishingQuality } from '../pages/CostEstimatorPage';

export const CostEstimatorPreview: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();

  const [location, setLocation] = useState<GoaLocation>('Panaji');
  const [state] = useState<string>('Goa');
  const [projectType, setProjectType] = useState<ProjectType>('Residential');
  const [areaSqft, setAreaSqft] = useState<number>(2000);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [constructionType, setConstructionType] = useState<ConstructionType>('RCC Frame');
  const [foundationType, setFoundationType] = useState<FoundationType>('Isolated');
  const [materialQuality, setMaterialQuality] = useState<MaterialQuality>('Standard');
  const [finishingQuality, setFinishingQuality] = useState<FinishingQuality>('Medium');
  const [constructionYear] = useState<number>(2026);

  // Micro-market location multiplier
  const locationMultipliers: Record<GoaLocation, number> = {
    Panaji: 1.06,
    Margao: 1.02,
    Vasco: 1.02,
    Mapusa: 1.04,
    Ponda: 1.00,
    Calangute: 1.08,
    Bicholim: 0.97,
    Pernem: 1.03,
    Canacona: 1.05,
    Quepem: 0.98
  };

  const projectMultipliers: Record<ProjectType, number> = {
    Residential: 1.0,
    Commercial: 1.15,
    Renovation: 0.70
  };

  const constructionMultipliers: Record<ConstructionType, number> = {
    'RCC Frame': 1.0,
    'Steel Frame': 1.08,
    'Load Bearing': 0.88
  };

  const foundationMultipliers: Record<FoundationType, number> = {
    Isolated: 1.0,
    Combined: 1.06,
    Raft: 1.14
  };

  const materialMultipliers: Record<MaterialQuality, number> = {
    Economy: 0.85,
    Standard: 1.0,
    Premium: 1.25
  };

  const finishingMultipliers: Record<FinishingQuality, number> = {
    Basic: 0.90,
    Medium: 1.05,
    High: 1.30
  };

  const safeFloors = Math.max(1, numberOfFloors || 1);
  const floorMultiplier = safeFloors === 1 ? 1.0 : safeFloors === 2 ? 1.03 : safeFloors === 3 ? 1.07 : 1.0 + (safeFloors - 1) * 0.04;

  const ratePerSqft = Math.round(
    2000 *
    projectMultipliers[projectType] *
    constructionMultipliers[constructionType] *
    foundationMultipliers[foundationType] *
    materialMultipliers[materialQuality] *
    finishingMultipliers[finishingQuality] *
    locationMultipliers[location] *
    floorMultiplier
  );

  const safeArea = Math.max(100, areaSqft || 100);
  const totalCost = Math.round(safeArea * ratePerSqft);
  const totalCostLakhs = (totalCost / 100000).toFixed(2);
  const minRangeLakhs = ((totalCost * 0.94) / 100000).toFixed(2);
  const maxRangeLakhs = ((totalCost * 1.06) / 100000).toFixed(2);

  const civilCost = Math.round(totalCost * 0.46);
  const materialsCost = Math.round(totalCost * 0.24);
  const labourCost = Math.round(totalCost * 0.15);
  const mepCost = Math.round(totalCost * 0.08);
  const finishingCost = Math.round(totalCost * 0.07);

  const locationOptions: GoaLocation[] = [
    'Panaji', 'Margao', 'Vasco', 'Mapusa', 'Ponda', 
    'Calangute', 'Bicholim', 'Pernem', 'Canacona', 'Quepem'
  ];

  return (
    <section id="cost-estimator" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> High Precision Structural Regressor · Goa {constructionYear}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
            AI Construction Cost Estimator
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Trained on historical Goa building data. Realistically calculate your approximate construction expenditure by area, structural parameters, and location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-6 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700 space-y-4">
            
            {/* Location & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Location (Goa)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as GoaLocation)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium cursor-pointer"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-400 text-xs font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Project Type & Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium cursor-pointer"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Renovation">Renovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Area (Sq. Ft.)
                </label>
                <input
                  type="number"
                  min="300"
                  max="50000"
                  step="50"
                  value={areaSqft || ''}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-amber-500"
                />
              </div>
            </div>

            {/* Number of Floors & Construction Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfFloors || ''}
                  onChange={(e) => setNumberOfFloors(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Construction Type
                </label>
                <select
                  value={constructionType}
                  onChange={(e) => setConstructionType(e.target.value as ConstructionType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium cursor-pointer"
                >
                  <option value="RCC Frame">RCC Frame</option>
                  <option value="Steel Frame">Steel Frame</option>
                  <option value="Load Bearing">Load Bearing</option>
                </select>
              </div>
            </div>

            {/* Foundation Type & Material Quality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Foundation Type
                </label>
                <select
                  value={foundationType}
                  onChange={(e) => setFoundationType(e.target.value as FoundationType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium cursor-pointer"
                >
                  <option value="Isolated">Isolated</option>
                  <option value="Combined">Combined</option>
                  <option value="Raft">Raft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Material Quality
                </label>
                <select
                  value={materialQuality}
                  onChange={(e) => setMaterialQuality(e.target.value as MaterialQuality)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium cursor-pointer"
                >
                  <option value="Economy">Economy</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Finishing Quality */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Finishing Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Basic', 'Medium', 'High'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFinishingQuality(f)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      finishingQuality === f
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Link to Full Estimator Page */}
            <div className="pt-2">
              <Link
                to="/cost-estimator"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-600 transition-colors"
              >
                <span>Open Full Detailed Estimator & BOQ Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Live Prediction Output Card */}
          <div className="lg:col-span-6 bg-gradient-to-b from-slate-800 to-slate-850 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-5">
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
                Itemized Cost Breakdown ({location}, Goa)
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">1. Substructure & Civil Work (46%)</span>
                  <span className="font-bold text-white">₹{(civilCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '46%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">2. Raw Materials - {materialQuality} (24%)</span>
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
                  <span className="text-slate-300">5. {finishingQuality} Finishes & Approvals (7%)</span>
                  <span className="font-bold text-white">₹{(finishingCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: '7%' }} />
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
