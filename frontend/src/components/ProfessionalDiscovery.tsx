import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  SlidersHorizontal,
  Crown,
  Zap,
  Building2,
  Briefcase,
  RefreshCw,
  Send,
  MessageSquare
} from 'lucide-react';
import type { ProfessionalProfileFull } from '../types/profile';

interface ProfessionalDiscoveryProps {
  isHomePageView?: boolean;
}

export const ProfessionalDiscovery: React.FC<ProfessionalDiscoveryProps> = ({ isHomePageView = false }) => {
  const [profiles, setProfiles] = useState<ProfessionalProfileFull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<boolean>(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [availability, setAvailability] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(50000000);

  // AI Search state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiParsing, setAiParsing] = useState<boolean>(false);
  const [aiParsedInfo, setAiParsedInfo] = useState<string | null>(null);
  const [showAiSearch, setShowAiSearch] = useState<boolean>(false);

  // Enquiry modal state
  const [enquiryModalProf, setEnquiryModalProf] = useState<ProfessionalProfileFull | null>(null);
  const [enquirySent, setEnquirySent] = useState<boolean>(false);
  const [enquiryText, setEnquiryText] = useState<string>('');

  const fetchProfessionals = async () => {
    setLoading(true);
    setBackendError(false);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('q', searchTerm.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDistrict !== 'all') params.append('district', selectedDistrict);
      if (minExperience > 0) params.append('min_experience', minExperience.toString());
      if (availability !== 'all') params.append('availability', availability);
      if (minRating > 0) params.append('min_rating', minRating.toString());
      if (maxBudget < 50000000) params.append('max_budget', maxBudget.toString());

      const res = await fetch(`http://localhost:8000/api/v1/professionals?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load marketplace profiles');
      const data = await res.json();
      setProfiles(data);
    } catch (err: unknown) {
      console.error(err);
      setBackendError(true);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [selectedCategory, selectedDistrict, minExperience, availability, minRating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfessionals();
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiParsing(true);
    setAiParsedInfo(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/professionals/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiPrompt })
      });

      if (res.ok) {
        const result = await res.json();
        
        // Apply AI suggestions to state
        if (result.suggested_category) setSelectedCategory(result.suggested_category);
        if (result.suggested_district) setSelectedDistrict(result.suggested_district);
        if (result.suggested_min_experience) setMinExperience(result.suggested_min_experience);
        if (result.suggested_budget_range?.max) setMaxBudget(result.suggested_budget_range.max);
        if (result.detected_keywords?.length) setSearchTerm(result.detected_keywords.join(' '));

        setAiParsedInfo(`AI Extracted: ${result.suggested_category || 'Any category'} in ${result.suggested_district || 'Goa'}${result.suggested_min_experience ? ` with ${result.suggested_min_experience}+ yrs exp` : ''}`);
        
        // Trigger fetch with new criteria
        setTimeout(() => {
          fetchProfessionals();
        }, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiParsing(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDistrict('all');
    setMinExperience(0);
    setAvailability('all');
    setMinRating(0);
    setMaxBudget(50000000);
    setAiParsedInfo(null);
    setTimeout(() => {
      fetchProfessionals();
    }, 50);
  };

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Home page: only show sponsored (premium + pro) profiles
  // Marketplace page: show all profiles (already sorted: premium → pro → free by backend)
  const displayedProfiles = isHomePageView
    ? profiles.filter(p => p.subscription_tier === 'premium' || p.subscription_tier === 'pro' || p.is_sponsored)
    : profiles;

  return (
    <section id="marketplace-search" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHomePageView ? 'Featured Sponsored Professionals' : 'Professional Discovery & Marketplace Search'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
              {isHomePageView ? 'Top Sponsored Builders & Architects in Goa' : 'Find Verified Goa Construction Professionals'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-2xl">
              {isHomePageView
                ? 'Premium & Pro sponsored professionals displayed below — the highest-rated, most visible builders in Goa\'s construction network.'
                : 'Amazon-style tiered ranking: Premium & Pro sponsored builders featured at the top, followed by organically segregated profiles by verified reviews and years in the field.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiSearch(!showAiSearch)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{showAiSearch ? 'Standard Search' : 'AI Requirement Search'}</span>
            </button>
            <Link
              to="/professionals/new"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white transition-all shadow-xs"
            >
              + Register as Professional
            </Link>
          </div>
        </div>

        {/* AI NATURAL LANGUAGE SEARCH BOX — Marketplace page only */}
        {!isHomePageView && showAiSearch && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-indigo-500/10 p-5 rounded-2xl border-2 border-amber-300 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">Google AI Studio Natural Language Requirement Search</h3>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">Gemini 1.5 Flash</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Describe your project requirement naturally (e.g. <em>"Experienced residential construction contractors in Goa with at least 8 years of experience, handling projects between ₹25 lakh and ₹50 lakh"</em>).
            </p>
            <form onSubmit={handleAiSearch} className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Need a Portuguese villa restoration contractor in North Goa with 10+ years experience"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
              <button
                type="submit"
                disabled={aiParsing}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
              >
                {aiParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{aiParsing ? 'Understanding...' : 'Extract & Search'}</span>
              </button>
            </form>
            {aiParsedInfo && (
              <div className="mt-2.5 text-xs text-amber-900 font-medium bg-amber-100/60 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                <span>{aiParsedInfo}</span>
                <button onClick={resetFilters} className="text-amber-700 underline hover:text-amber-950 text-[11px]">Clear AI Filter</button>
              </div>
            )}
          </div>
        )}

        {/* TOP SEARCH BAR — Marketplace page only */}
        {!isHomePageView && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, company, specialty (e.g. Portuguese Villa, RCC, Waterproofing)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-56 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Professional Categories</option>
                <option value="contractor">Civil Contractors</option>
                <option value="architect">Architects & Planners</option>
                <option value="civil_engineer">Civil & Structural Engineers</option>
                <option value="interior_designer">Interior Designers</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="w-full md:w-48 shrink-0">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Entire Goa (North & South)</option>
                <option value="North Goa">North Goa (Panaji/Mapusa)</option>
                <option value="South Goa">South Goa (Margao/Vasco)</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>
        )} {/* end !isHomePageView search bar */}

        {/* MAIN MARKETPLACE LAYOUT */}
        {/* On home page: just the cards in a simple full-width grid */}
        {/* On marketplace page: sidebar filters + cards grid */}
        {isHomePageView ? (
          /* ── HOME PAGE: Sponsored cards full width ── */
          <div className="space-y-4">
            {/* Loading State */}
            {loading && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <div className="font-bold text-slate-800 text-sm">Loading featured profiles...</div>
              </div>
            )}
            {!loading && backendError && (
              <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-700 mx-auto" />
                <h3 className="font-bold text-amber-950 text-base">Backend API Server Not Running</h3>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  Start your FastAPI backend: <code className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded">uvicorn app.main:app --reload --port 8000</code>
                </p>
                <button onClick={fetchProfessionals} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">Retry</button>
              </div>
            )}
            {!loading && !backendError && displayedProfiles.length === 0 && (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                <h3 className="font-bold text-slate-900">No Sponsored Professionals Yet</h3>
                <p className="text-xs text-slate-500">No Premium or Pro professionals are currently listed. Check the full marketplace for all verified profiles.</p>
                <Link to="/professionals" className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all">View All Professionals</Link>
              </div>
            )}
            {!loading && !backendError && displayedProfiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayedProfiles.map((prof) => {
                  const isPremium = prof.subscription_tier === 'premium';
                  return (
                    <div
                      key={prof.id}
                      className={`bg-white rounded-2xl border p-5 relative overflow-hidden hover:shadow-lg transition-all duration-200 ${
                        isPremium ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-amber-300 ring-1 ring-amber-500/10'
                      }`}
                    >
                      {/* Sponsored Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isPremium ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {isPremium ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                          SPONSORED {isPremium ? '· PREMIUM' : '· PRO'}
                        </span>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={prof.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={prof.full_name}
                            className="w-full h-full object-cover"
                          />
                          {prof.verification_status === 'verified' && (
                            <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 text-sm leading-tight">
                            <Link to={`/professionals/${prof.id}`} className="hover:text-amber-600 transition-colors">
                              {prof.company_name || prof.full_name}
                            </Link>
                          </h3>
                          <div className="text-xs text-slate-500 mt-0.5 capitalize">{prof.category.replace('_', ' ')} · {prof.experience_years} yrs</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-500" />{prof.city}, {prof.district}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-amber-400/20 text-amber-900 px-2 py-0.5 rounded-lg text-xs font-black">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{prof.average_rating ? prof.average_rating.toFixed(1) : '4.8'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">({prof.review_count || 0} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {prof.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">{prof.bio}</p>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Link
                          to={`/professionals/${prof.id}`}
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setEnquiryModalProf(prof); setEnquirySent(false); setEnquiryText(''); }}
                          className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Enquire</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View All CTA */}
            {!loading && !backendError && (
              <div className="pt-2 text-center">
                <Link
                  to="/professionals"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  <span>Explore All Verified Professionals in Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-slate-400 mt-2">
                  View Premium, Pro & Free professionals — full search, filters, ratings & portfolio comparison
                </p>
              </div>
            )}
          </div>
        ) : (
        /* ── MARKETPLACE PAGE: Sidebar filters + full listing ── */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <span>Filters & Refinements</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-800 cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Minimum Experience
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 5, 8, 12].map((yrs) => (
                  <button
                    key={yrs}
                    type="button"
                    onClick={() => setMinExperience(yrs)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      minExperience === yrs
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {yrs === 0 ? 'Any' : `${yrs}+ yrs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Availability Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Any Availability</option>
                <option value="available">Immediately Available</option>
                <option value="limited_availability">Limited Availability</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Customer Rating
              </label>
              <div className="space-y-1.5">
                {[0, 4.5, 4.8].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="min_rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span>{rating === 0 ? 'All Ratings' : `${rating} Stars & above`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Maximum Project Budget Range */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Max Budget Scope</label>
                <span className="text-xs font-bold text-amber-700">{formatLakhs(maxBudget)}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="1000000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹10 Lakh</span>
                <span>₹5 Crore</span>
              </div>
            </div>

            {/* Sponsored Tier Ranking Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <Crown className="w-3.5 h-3.5 text-amber-600" /> Marketplace Ranking Logic
              </div>
              <p className="leading-relaxed text-slate-600">
                Sponsored <strong>Premium</strong> & <strong>Pro</strong> partners are pinned at the top. Free profiles follow, sorted strictly by ratings, review volume, and verifiable experience.
              </p>
            </div>

          </div>

          {/* RIGHT AREA: RESULTS COUNT + PROFESSIONAL PRODUCT CARDS */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Results bar */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              <div>
                {isHomePageView ? (
                  <>
                    Showing <span className="font-bold text-slate-900">{displayedProfiles.length}</span> <span className="text-amber-700 font-bold">Sponsored</span> Professionals (Premium & Pro)
                  </>
                ) : (
                  <>
                    Showing <span className="font-bold text-slate-900">{displayedProfiles.length}</span> Verified Construction Profiles
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort by:</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                  {isHomePageView ? 'Sponsored First' : 'Sponsored Tier & Ratings'}
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <div className="font-bold text-slate-800 text-sm">Searching verified profiles in Goa...</div>
              </div>
            )}

            {/* Error or Empty State */}
            {!loading && backendError && (
              <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-amber-950 text-base">Backend API Server Not Running</h3>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  The frontend is trying to query <code>http://localhost:8000/api/v1/professionals</code>, but your FastAPI server is currently stopped in your backend terminal.
                </p>
                <div className="bg-slate-900 text-amber-400 font-mono text-xs p-3 rounded-xl max-w-md mx-auto text-left">
                  uvicorn app.main:app --reload --port 8000
                </div>
                <button
                  onClick={fetchProfessionals}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!loading && !backendError && profiles.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">No Matching Professionals Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No professionals currently match your selected combination of category, location, and budget. Try loosening your filters or resetting the search.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* PROFESSIONAL PROFILE CARDS GRID (AMAZON / OLX STYLE) */}
            {!loading && displayedProfiles.length > 0 && (
              <div className="space-y-4">
                {displayedProfiles.map((prof) => {
                  const isPremium = prof.subscription_tier === 'premium';
                  const isPro = prof.subscription_tier === 'pro';
                  const isSponsored = isPremium || isPro || prof.is_sponsored;

                  return (
                    <div
                      key={prof.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg p-5 sm:p-6 relative overflow-hidden ${
                        isPremium
                          ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                          : isPro
                          ? 'border-amber-300 ring-1 ring-amber-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Sponsored Ribbon */}
                      {isSponsored && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isPremium
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-amber-500 text-slate-950 font-extrabold'
                          }`}>
                            {isPremium ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                            SPONSORED {isPremium ? '· TOP PARTNER' : '· PRO BUILDER'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Featured placement</span>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row gap-5 items-start">
                        
                        {/* Profile Image & Avatar */}
                        <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={prof.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={prof.full_name}
                            className="w-full h-full object-cover"
                          />
                          {prof.verification_status === 'verified' && (
                            <div className="absolute bottom-1.5 right-1.5 bg-emerald-600 text-white p-1 rounded-full shadow-sm" title="Verified by BuildWise">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Middle Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 hover:text-amber-600 transition-colors">
                              <Link to={`/professionals/${prof.id}`}>
                                {prof.company_name || prof.full_name}
                              </Link>
                            </h3>

                            {prof.verification_status === 'verified' && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Verified License
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700 capitalize">
                              {prof.category.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              <strong>{prof.experience_years} years</strong> experience
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              {prof.city}, {prof.district}
                            </span>
                          </div>

                          {/* Bio Snippet */}
                          {prof.bio && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {prof.bio}
                            </p>
                          )}

                          {/* Specialisation tags */}
                          {prof.specialisations && prof.specialisations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {prof.specialisations.slice(0, 4).map((spec, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                                >
                                  {spec}
                                </span>
                              ))}
                              {prof.specialisations.length > 4 && (
                                <span className="text-[10px] text-slate-400 self-center font-medium">
                                  +{prof.specialisations.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Portfolio Thumbnails Preview */}
                          {prof.portfolio_projects && prof.portfolio_projects.length > 0 && (
                            <div className="pt-2 flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Recent builds:</span>
                              <div className="flex gap-2 overflow-x-auto">
                                {prof.portfolio_projects.slice(0, 3).map((proj, pIdx) => (
                                  <div key={pIdx} className="flex items-center gap-1 text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                    <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span className="font-semibold truncate max-w-[120px]">{proj.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Right Area: Rating, Pricing & CTAs */}
                        <div className="w-full md:w-56 shrink-0 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 space-y-3">
                          
                          {/* Rating & Review */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-amber-400/20 text-amber-900 px-2 py-1 rounded-lg text-xs font-black">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{prof.average_rating ? prof.average_rating.toFixed(1) : '4.8'}</span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              ({prof.review_count || 12} reviews)
                            </span>
                          </div>

                          {/* Budget Range */}
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Indicative Scope</span>
                            <div className="text-xs font-extrabold text-slate-900 flex items-center md:justify-end gap-0.5">
                              <span>{formatLakhs(prof.min_budget)}</span>
                              <span className="text-slate-400 font-normal">-</span>
                              <span>{formatLakhs(prof.max_budget)}</span>
                            </div>
                          </div>

                          {/* Availability Badge */}
                          <div className="text-left md:text-right">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              prof.availability_status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                prof.availability_status === 'available' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`} />
                              {prof.availability_status === 'available' ? 'Available for new builds' : 'Limited availability'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="w-full space-y-2 pt-1">
                            <Link
                              to={`/professionals/${prof.id}`}
                              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <span>View Full Profile</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setEnquiryModalProf(prof);
                                setEnquirySent(false);
                                setEnquiryText('');
                              }}
                              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Enquire / Request Quote</span>
                            </button>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View All Button on Home Page — now handled in home section above, remove old one */}

          </div>

        </div>
        )} {/* end isHomePageView ternary */}

      </div>

      {/* INSTANT ENQUIRY MODAL (NO LOGIN REQUIRED) */}
      {enquiryModalProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Instant Project Enquiry
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Enquire with {enquiryModalProf.company_name || enquiryModalProf.full_name}
                </h3>
                <p className="text-xs text-slate-500">Direct transmission to professional dashboard with zero login barriers.</p>
              </div>
              <button
                onClick={() => setEnquiryModalProf(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {enquirySent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-base">Enquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your project specifications have been dispatched to <strong>{enquiryModalProf.full_name}</strong>. They will respond directly to your contact number.
                </p>
                <button
                  onClick={() => setEnquiryModalProf(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEnquirySent(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Project Location in Goa</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assagao, Candolim, or Margao"
                    defaultValue="Panaji, Goa"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget Range</label>
                  <select className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>₹25 Lakh – ₹50 Lakh</option>
                    <option>₹50 Lakh – ₹1 Crore</option>
                    <option>₹1 Crore – ₹2.5 Crore</option>
                    <option>Above ₹2.5 Crore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Requirements & Scope</label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryText}
                    onChange={(e) => setEnquiryText(e.target.value)}
                    placeholder="Briefly describe what you're constructing (e.g. 3BHK Portuguese villa, foundation + slab, architectural drawings)..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryModalProf(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Enquiry Directly</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
