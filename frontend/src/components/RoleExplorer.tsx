import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import type { UserRole } from '../types';
import { Home, HardHat, Truck, CheckCircle2, ArrowRight, ShieldCheck, Cpu, FileCheck, Coins, Users } from 'lucide-react';

export const RoleExplorer: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal, switchRole } = useUser();
  const [activeTab, setActiveTab] = useState<UserRole>('customer');

  const handleRegisterRole = (role: UserRole) => {
    setSelectedRoleForModal(role);
    setOpenRegisterModal(true);
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            One Unified Construction Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Whether you are building your personal dream villa in Goa, bidding for high-value contracts, or distributing raw construction supplies.
          </p>
        </div>

        {/* 3-Role Interactive Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner max-w-2xl w-full">
            
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>For Property Owners</span>
            </button>

            <button
              onClick={() => setActiveTab('professional')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'professional'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>For Contractors & Pros</span>
            </button>

            <button
              onClick={() => setActiveTab('supplier')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'supplier'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>For Material Suppliers</span>
            </button>

          </div>
        </div>

        {/* Tab 1: Customer View */}
        {activeTab === 'customer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                <Home className="w-3.5 h-3.5" /> For Homeowners, Builders & Property Developers
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Turn your construction ideas into structured blueprints with transparent quotations.
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No more guessing rates, chasing elusive contractors, or decoding confusing paper estimates. BuildWise empowers you with automated cost forecasts, side-by-side contractor comparisons, and verified milestone tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>AI Requirement Analyzer:</strong> Describe in plain words, get structured BOQ.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Smart Quotation Audit:</strong> Compare materials, labour, and warranties side-by-side.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Verified Goa Contractors:</strong> Validated license, GSTIN, and previous site track record.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Milestone Tracking:</strong> Review site photos before releasing staged progress payouts.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleRegisterRole('customer')}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Register as Property Owner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => switchRole('customer')}
                  className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Try Demo Customer Mode
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Journey Preview</div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">1. Post Requirements</div>
                    <div className="text-[11px] text-slate-500">2,400 sq.ft Villa in Margao</div>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">AI Analyzed</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">2. Receive 4 Contractor Quotes</div>
                    <div className="text-[11px] text-slate-500">₹44.2L vs ₹47.5L vs ₹48.0L</div>
                  </div>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Side-by-Side</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">3. Milestone 2: Foundation Pouring</div>
                    <div className="text-[11px] text-slate-500">12 Site Photos Logged by Contractor</div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Approved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Professional View */}
        {activeTab === 'professional' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                <HardHat className="w-3.5 h-3.5" /> For Civil Contractors, Architects & Engineers
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Stop chasing cold leads. Win pre-qualified construction projects across Goa.
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                BuildWise connects you directly with serious property owners who have verified budgets and defined architectural requirements. Receive project opportunities matched to your specialization and location.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <Coins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>50 Free Lead Credits:</strong> Instant signup bonus to submit proposals immediately.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Verified Pro Profile:</strong> Showcase completed villas, license, and client reviews.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Digital Quotation Builder:</strong> Itemize civil, materials, and labour in minutes.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Direct Client Messaging:</strong> Seamless communication without brokerage leakages.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleRegisterRole('professional')}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Register as Professional / Contractor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => switchRole('professional')}
                  className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Try Demo Contractor Mode
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Contractor Opportunity Feed</div>
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">New High-Intent Lead</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">3-Storey Residential House, Porvorim</h4>
                    <p className="text-[11px] text-slate-400">Area: 3,200 sq.ft · Budget: ₹65 - ₹75 Lakhs</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">10 Credits</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Customer Verified ✓</span>
                  <span className="text-amber-400 font-semibold">Express Interest →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Supplier View */}
        {activeTab === 'supplier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <Truck className="w-3.5 h-3.5" /> For Cement, Steel, Bricks, Tiles & MEP Vendors
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Supply directly to active construction sites and contractors in your district.
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                List your building products, receive direct bulk inquiries, and eliminate middlemen margins. BuildWise provides material suppliers with direct demand signals from ongoing residential and commercial projects across Goa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Product Catalog:</strong> Publish unit prices for cement, TMT rebars, laterite stone, and tiles.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Bulk RFQ Inquiries:</strong> Direct requests for quotation from contractors on the platform.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Delivery Radius Control:</strong> Specify service areas (Bardez, Tiswadi, Salcete, etc.).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium"><strong>Sponsored Product Cards:</strong> Promote your products at the top of builder searches.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleRegisterRole('supplier')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Register as Material Supplier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => switchRole('supplier')}
                  className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Try Demo Supplier Mode
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplier Catalog Preview</div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tata Tiscon 550D Rebars</div>
                    <div className="text-[11px] text-slate-500">Goa Steel Corp · Margao Yard</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">₹62,500/MT</span>
                    <span className="block text-[10px] text-slate-400">In Stock</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">UltraTech Weather Plus PPC</div>
                    <div className="text-[11px] text-slate-500">Mandovi Building Supplies</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">₹385/Bag</span>
                    <span className="block text-[10px] text-slate-400">In Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
