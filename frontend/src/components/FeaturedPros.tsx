import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { FEATURED_PROFESSIONALS } from '../data/mockData';
import { Star, MapPin, ShieldCheck, ArrowRight, Award, MessageSquare } from 'lucide-react';
import type { FeaturedProfessional } from '../types';

interface FeaturedProsProps {
  onStartChat?: (pro: FeaturedProfessional) => void;
}

export const FeaturedPros: React.FC<FeaturedProsProps> = ({ onStartChat }) => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  const filteredPros = FEATURED_PROFESSIONALS.filter((pro) => {
    if (filterCategory !== 'all' && pro.category !== filterCategory) return false;
    if (filterDistrict !== 'all' && pro.district !== filterDistrict) return false;
    return true;
  });

  return (
    <section id="professionals" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200">
              Verified Construction Network · Feature 1 & 2
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Top-Rated Goa Builders & Architects
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Every professional is manually vetted for valid registration, PWD/CoA license, and verifiable previous villa & residential builds across Goa.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="contractor">Civil Contractors</option>
              <option value="architect">Architects</option>
              <option value="civil_engineer">Civil Engineers</option>
              <option value="interior_designer">Interior Designers</option>
            </select>

            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Goa Districts</option>
              <option value="North Goa">North Goa (Panaji / Mapusa)</option>
              <option value="South Goa">South Goa (Margao / Vasco)</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPros.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Project Cover Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={pro.image}
                    alt={pro.companyName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Builder
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pro.rating}</span>
                    <span className="text-slate-400 text-[10px]">({pro.reviewCount})</span>
                  </div>

                  {/* Location Pin */}
                  <div className="absolute bottom-2.5 left-3 text-white text-xs flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{pro.location}</span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{pro.companyName}</h3>
                      <div className="text-[11px] text-slate-500">{pro.categoryLabel} · {pro.experienceYears} yrs exp</div>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Specialization:</span>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-700">{pro.specialization}</p>
                  </div>

                  {/* Metric stats */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs py-1">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-900">{pro.completedProjects}</span>
                      <span className="block text-[10px] text-slate-400">Completed Builds</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-900">₹{pro.startingRatePerSqft}</span>
                      <span className="block text-[10px] text-slate-400">Starting/sq.ft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => {
                    setSelectedRoleForModal('customer');
                    setOpenRegisterModal(true);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Request Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onStartChat && (
                  <button
                    onClick={() => onStartChat(pro)}
                    className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chat with Contractor</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Contractor CTA banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" /> Are you an architect or contractor in Goa?
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Join 250+ Verified Goan Construction Professionals
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Get listed, win verified residential villa leads, and receive 50 complimentary lead credits instantly upon registration.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedRoleForModal('professional');
              setOpenRegisterModal(true);
            }}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <span>Register as Contractor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
