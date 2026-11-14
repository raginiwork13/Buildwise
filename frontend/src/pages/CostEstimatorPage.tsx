import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  Info, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  HardHat, 
  Calendar, 
  Check, 
  SlidersHorizontal, 
  Home, 
  MapPin, 
  Layers, 
  RotateCcw,
  Calculator,
  Loader2,
  AlertCircle
} from 'lucide-react';

export type GoaLocation = 
  | 'Panaji'
  | 'Margao'
  | 'Vasco'
  | 'Mapusa'
  | 'Ponda'
  | 'Calangute'
  | 'Bicholim'
  | 'Pernem'
  | 'Canacona'
  | 'Quepem';

export type ProjectType = 'Residential' | 'Commercial' | 'Renovation';
export type ConstructionType = 'RCC Frame' | 'Steel Frame' | 'Load Bearing';
export type FoundationType = 'Isolated' | 'Combined' | 'Raft';
export type MaterialQuality = 'Economy' | 'Standard' | 'Premium';
export type FinishingQuality = 'Basic' | 'Medium' | 'High';

export interface MLPredictionResult {
  status: string;
  model_name: string;
  predicted_cost: number;
  total_cost_lakhs: string;
  rate_per_sqft: number;
  min_range_lakhs: string;
  max_range_lakhs: string;
  breakdown: {
    foundation: number;
    superstructure: number;
    materials: number;
    labour: number;
    mep: number;
    finishing: number;
  };
  breakdown_percentages: {
    foundation: number;
    superstructure: number;
    materials: number;
    labour: number;
    mep: number;
    finishing: number;
  };
  boq: {
    cement_bags: number;
    steel_tonnes: number;
    sand_cuft: number;
    aggregates_cuft: number;
  };
  timeline_months: string;
}

export const CostEstimatorPage: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();

  // User input states with required defaults
  const [location, setLocation] = useState<GoaLocation>('Panaji');
  const [state] = useState<string>('Goa'); // Fixed default
  const [projectType, setProjectType] = useState<ProjectType>('Residential');
  const [areaSqft, setAreaSqft] = useState<number>(2000);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [constructionType, setConstructionType] = useState<ConstructionType>('RCC Frame');
  const [foundationType, setFoundationType] = useState<FoundationType>('Isolated');
  const [materialQuality, setMaterialQuality] = useState<MaterialQuality>('Standard');
  const [finishingQuality, setFinishingQuality] = useState<FinishingQuality>('Medium');
  const [constructionYear, setConstructionYear] = useState<number>(2026);

  // ML model prediction states
  const [mlResult, setMlResult] = useState<MLPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const locationOptions: GoaLocation[] = [
    'Panaji',
    'Margao',
    'Vasco',
    'Mapusa',
    'Ponda',
    'Calangute',
    'Bicholim',
    'Pernem',
    'Canacona',
    'Quepem'
  ];

  const handleResetDefaults = () => {
    setLocation('Panaji');
    setProjectType('Residential');
    setAreaSqft(2000);
    setNumberOfFloors(2);
    setConstructionType('RCC Frame');
    setFoundationType('Isolated');
    setMaterialQuality('Standard');
    setFinishingQuality('Medium');
    setConstructionYear(2026);
    setMlResult(null);
    setApiError(null);
  };

  const handleEstimateCost = async () => {
    setIsLoading(true);
    setApiError(null);

    const payload = {
      location,
      state: 'Goa',
      project_type: projectType,
      area_sqft: Number(areaSqft) || 2000,
      num_floors: Number(numberOfFloors) || 1,
      construction_type: constructionType,
      foundation_type: foundationType,
      material_quality: materialQuality,
      finishing_quality: finishingQuality,
      year: Number(constructionYear) || 2026
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cost-estimator/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Server returned error status ${res.status}`);
      }

      const data: MLPredictionResult = await res.json();
      setMlResult(data);
    } catch (err: any) {
      console.error('Failed to get ML prediction:', err);
      setApiError(err.message || 'Unable to connect to the ML estimation service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Breadcrumb & Header Actions */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-amber-400 font-medium">AI Construction Cost Estimator</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Reset inputs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
            {mlResult && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print / Save PDF</span>
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Hero Title */}
        <div className="mt-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Trained ML Pipeline · construction_cost_model.pkl</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            AI Construction Cost Estimator
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
            Configure your structural specifications and click <strong className="text-amber-400">Estimate Cost</strong> to run your custom machine learning model and calculate predictions.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs Form & Output Display */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-6">
            
            {/* Section 1: Location & Project Scope */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700">
                <MapPin className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Location & Project Scope
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State: Goa (Default) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    State
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={state}
                      readOnly
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 font-semibold text-sm cursor-not-allowed select-none"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Default
                    </span>
                  </div>
                </div>

                {/* Location: Dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Location (Goa Region)
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as GoaLocation)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc} className="bg-slate-900 text-white py-1">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Project Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Renovation">Renovation</option>
                  </select>
                </div>

                {/* Construction Year */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Construction Year
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={2024}
                      max={2035}
                      value={constructionYear}
                      onChange={(e) => setConstructionYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:border-amber-500"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Structural Specifications */}
            <div className="pt-2">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Structural Specifications
                </h2>
              </div>

              {/* Area & Number of Floors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Area: Numeric input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Area (Sq. Ft.)
                    </label>
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {areaSqft ? areaSqft.toLocaleString() : 0} sq.ft
                    </span>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    step="50"
                    value={areaSqft || ''}
                    onChange={(e) => setAreaSqft(Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Min: 100 sq.ft</span>
                    <span>Common: 1,500 – 3,500 sq.ft</span>
                  </div>
                </div>

                {/* Number of Floors: Numeric input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Number of Floors
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfFloors || ''}
                    onChange={(e) => setNumberOfFloors(Math.max(1, Number(e.target.value)))}
                    placeholder="e.g. 2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    {numberOfFloors === 1 ? 'Ground floor only (G)' : `G + ${numberOfFloors - 1} Upper Floors`}
                  </div>
                </div>
              </div>

              {/* Construction Type */}
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Construction Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['RCC Frame', 'Steel Frame', 'Load Bearing'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setConstructionType(type)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        constructionType === type
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{type}</span>
                        {constructionType === type && <Check className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                      <div className={`text-[10px] mt-1 ${constructionType === type ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {type === 'RCC Frame' && 'Reinforced concrete columns & beams'}
                        {type === 'Steel Frame' && 'Structural steel columns & girders'}
                        {type === 'Load Bearing' && 'Masonry structural walls'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Foundation Type */}
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Foundation Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Isolated', 'Combined', 'Raft'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFoundationType(type)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        foundationType === type
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{type}</span>
                        {foundationType === type && <Check className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                      <div className={`text-[10px] mt-1 ${foundationType === type ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {type === 'Isolated' && 'Standard individual column footings'}
                        {type === 'Combined' && 'Shared footing for 2+ columns'}
                        {type === 'Raft' && 'Full mat slab for coastal soil'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Material & Finishing Quality */}
            <div className="pt-2">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Material & Finishing Quality
                </h2>
              </div>

              {/* Material Quality */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Material Quality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Economy', 'Standard', 'Premium'] as const).map((mTier) => (
                    <button
                      key={mTier}
                      type="button"
                      onClick={() => setMaterialQuality(mTier)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        materialQuality === mTier
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{mTier}</span>
                        {materialQuality === mTier && <Check className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                      <div className={`text-[10px] mt-1 ${materialQuality === mTier ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {mTier === 'Economy' && 'Local cement & Fe 500 steel'}
                        {mTier === 'Standard' && 'UltraTech/ACC & Fe 550D TMT'}
                        {mTier === 'Premium' && 'Tata Tiscon / JSW Anti-corrosion'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finishing Quality */}
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Finishing Quality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Basic', 'Medium', 'High'] as const).map((fTier) => (
                    <button
                      key={fTier}
                      type="button"
                      onClick={() => setFinishingQuality(fTier)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        finishingQuality === fTier
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{fTier}</span>
                        {finishingQuality === fTier && <Check className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                      <div className={`text-[10px] mt-1 ${finishingQuality === fTier ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {fTier === 'Basic' && 'Vitrified tiles, aluminum windows'}
                        {fTier === 'Medium' && 'GVT tiles, UPVC windows, Jaquar'}
                        {fTier === 'High' && 'Italian marble, soundproof UPVC, Kohler'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ESTIMATE COST ACTION BUTTON */}
            <div className="pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={handleEstimateCost}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Calculating Cost with AI Model...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    <span>Estimate Cost</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Results Section (Displayed ONLY after clicking Estimate Cost) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-slate-800 to-slate-850 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 sticky top-24">
            
            {/* STATE 1: ERROR STATE */}
            {apiError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Estimation Service Error</span>
                </div>
                <p className="leading-relaxed">{apiError}</p>
                <button
                  type="button"
                  onClick={handleEstimateCost}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold text-[11px] cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* STATE 2: LOADING STATE */}
            {isLoading && (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Evaluating Construction Dataset...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Executing the trained GradientBoostingRegressor pipeline for {areaSqft.toLocaleString()} sq.ft in {location}, Goa.
                  </p>
                </div>
              </div>
            )}

            {/* STATE 3: INITIAL AWAITING ESTIMATION (No Result Yet) */}
            {!isLoading && !mlResult && !apiError && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                  <Calculator className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Ready to Estimate</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Select your structural specifications on the left, then click the <strong className="text-amber-400">Estimate Cost</strong> button to run the machine learning model.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-left space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Setup</div>
                  <div className="text-xs text-slate-300 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">📍 {location}, Goa</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800">{areaSqft.toLocaleString()} sq.ft</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800">{numberOfFloors} Floor{numberOfFloors > 1 ? 's' : ''}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800">{constructionType}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800">{materialQuality}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEstimateCost}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Click to Estimate Cost</span>
                </button>
              </div>
            )}

            {/* STATE 4: MODEL RESULT DISPLAYED ONLY AFTER BUTTON CLICK */}
            {!isLoading && mlResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Projected Grand Total */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> ML Model Forecasted Cost
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Model Predicted
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{mlResult.total_cost_lakhs} <span className="text-2xl font-bold text-amber-400">Lakhs</span>
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Confidence Range: ₹{mlResult.min_range_lakhs}L — ₹{mlResult.max_range_lakhs}L (~₹{mlResult.rate_per_sqft.toLocaleString()}/sq.ft)
                    </span>
                  </div>
                </div>

                {/* Applied Parameters Cloud */}
                <div className="pt-2 border-t border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Evaluated Features</div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-700">
                      📍 {location}, {state}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {projectType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {constructionType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {foundationType} Foundation
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {materialQuality} Material
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {finishingQuality} Finishes
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {numberOfFloors} {numberOfFloors === 1 ? 'Floor' : 'Floors'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {constructionYear}
                    </span>
                  </div>
                </div>

                {/* Stage-wise Itemized Breakdown */}
                <div className="pt-4 border-t border-slate-700 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <span>Cost Component Breakdown</span>
                    <span className="text-[10px] text-amber-400 font-normal">Itemized</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">1. Substructure & {foundationType} Foundation ({mlResult.breakdown_percentages.foundation}%)</span>
                      <span className="font-bold text-white">₹{(mlResult.breakdown.foundation / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${mlResult.breakdown_percentages.foundation}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">2. Superstructure & {constructionType} ({mlResult.breakdown_percentages.superstructure}%)</span>
                      <span className="font-bold text-white">₹{(mlResult.breakdown.superstructure / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mlResult.breakdown_percentages.superstructure}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">3. Raw Materials - {materialQuality} ({mlResult.breakdown_percentages.materials}%)</span>
                      <span className="font-bold text-white">₹{(mlResult.breakdown.materials / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mlResult.breakdown_percentages.materials}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">4. Labour & Execution Charges ({mlResult.breakdown_percentages.labour}%)</span>
                      <span className="font-bold text-white">₹{(mlResult.breakdown.labour / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mlResult.breakdown_percentages.labour}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">5. Plumbing, Electrical & MEP ({mlResult.breakdown_percentages.mep}%)</span>
                      <span className="font-bold text-white">₹{(mlResult.breakdown.mep / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${mlResult.breakdown_percentages.mep}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">6. {finishingQuality} Finishes & Weatherproofing ({mlResult.breakdown_percentages.finishing}%)</span>
                      <span className="font-bold text-white">₹{(mlResult.breakdown.finishing / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${mlResult.breakdown_percentages.finishing}%` }} />
                    </div>
                  </div>
                </div>

                {/* Estimated Material Quantities (BOQ Preview) */}
                <div className="pt-4 border-t border-slate-700">
                  <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block mb-2.5">
                    Approximate Key Materials Required
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Cement Bags ({materialQuality})</div>
                      <div className="text-sm font-bold text-white mt-0.5">~{mlResult.boq.cement_bags.toLocaleString()} bags</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">TMT Steel ({constructionType})</div>
                      <div className="text-sm font-bold text-white mt-0.5">~{mlResult.boq.steel_tonnes} Metric Tonnes</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Fine Sand / M-Sand</div>
                      <div className="text-sm font-bold text-white mt-0.5">~{mlResult.boq.sand_cuft.toLocaleString()} cu.ft</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Coarse Aggregates</div>
                      <div className="text-sm font-bold text-white mt-0.5">~{mlResult.boq.aggregates_cuft.toLocaleString()} cu.ft</div>
                    </div>
                  </div>
                </div>

                {/* Estimated Project Timeline */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300 font-medium">Estimated Build Timeline:</span>
                  </div>
                  <span className="font-bold text-amber-300">{mlResult.timeline_months}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2.5">
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

                  <Link
                    to="/"
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explore Verified Contractors in {location}</span>
                  </Link>

                  <div className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Prediction generated by {mlResult.model_name}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
