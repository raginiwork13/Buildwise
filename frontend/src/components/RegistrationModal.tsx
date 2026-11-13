import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import type { UserRole, ProfessionalCategory } from '../types';
import { Home, HardHat, Truck, CheckCircle2, Sparkles, X, User, Crown, Zap, Shield } from 'lucide-react';

export const RegistrationModal: React.FC = () => {
  const { openRegisterModal, setOpenRegisterModal, registerUser, selectedRoleForModal, setSelectedRoleForModal, switchRole } = useUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Professional fields
  const [companyName, setCompanyName] = useState('');
  const [professionalCategory, setProfessionalCategory] = useState<ProfessionalCategory>('contractor');
  const [experienceYears, setExperienceYears] = useState(6);
  const [locationDistrict, setLocationDistrict] = useState('North Goa');
  const [city, setCity] = useState('Panaji');
  
  // Supplier fields
  const [businessName, setBusinessName] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('Verna Industrial Estate');
  
  // Customer fields
  const [defaultLocation, setDefaultLocation] = useState('Margao, Goa');

  // Subscription plan selection
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('pro');

  if (!openRegisterModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    registerUser({
      role: selectedRoleForModal,
      fullName,
      email,
      phone: phone || '+91 98221 00000',
      companyName: companyName || `${fullName} Constructions`,
      professionalCategory,
      experienceYears: Number(experienceYears),
      locationDistrict,
      city,
      businessName: businessName || `${fullName} Building Materials`,
      warehouseLocation,
      defaultLocation,
      subscriptionTier: selectedRoleForModal === 'professional' ? subscriptionTier : 'free',
      isSponsored: selectedRoleForModal === 'professional' ? (subscriptionTier === 'premium' || subscriptionTier === 'pro') : false
    });
  };

  const handleQuickSelectDemo = (role: UserRole) => {
    switchRole(role);
    setOpenRegisterModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 text-white relative">
          <button 
            onClick={() => setOpenRegisterModal(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Zero-Password Registration
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Join BuildWise Marketplace</h2>
          <p className="text-slate-300 text-sm mt-1">Select your role to get immediate access to Goa's construction network.</p>
        </div>

        {/* Quick Demo Pre-fills for Testing */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <span className="font-medium flex items-center gap-1">
            ⚡ Hackathon Quick Switch:
          </span>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => handleQuickSelectDemo('customer')}
              className="hover:underline font-semibold text-amber-800 cursor-pointer"
            >
              Demo Customer
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={() => handleQuickSelectDemo('professional')}
              className="hover:underline font-semibold text-amber-800 cursor-pointer"
            >
              Demo Contractor
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={() => handleQuickSelectDemo('supplier')}
              className="hover:underline font-semibold text-amber-800 cursor-pointer"
            >
              Demo Supplier
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Step 1: Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              1. What describes you best?
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRoleForModal('customer')}
                className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedRoleForModal === 'customer'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  selectedRoleForModal === 'customer' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Customer</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Building or renovating</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleForModal('professional')}
                className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedRoleForModal === 'professional'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  selectedRoleForModal === 'professional' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Professional</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Contractor, Architect</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleForModal('supplier')}
                className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedRoleForModal === 'supplier'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  selectedRoleForModal === 'supplier' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Supplier</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Cement, Steel, Tiles</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Personal Details */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              2. Your Basic Information
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Naik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-2.5">
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98221 XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Step 3: Role-Specific Details */}
          {selectedRoleForModal === 'professional' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-600" /> Professional Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Fernandes & Sons"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={professionalCategory}
                    onChange={(e) => setProfessionalCategory(e.target.value as ProfessionalCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="contractor">Civil Contractor</option>
                    <option value="architect">Architect & Planner</option>
                    <option value="civil_engineer">Civil / Structural Engineer</option>
                    <option value="interior_designer">Interior Designer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Goa District</label>
                  <select
                    value={locationDistrict}
                    onChange={(e) => setLocationDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="North Goa">North Goa</option>
                    <option value="South Goa">South Goa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    placeholder="Panaji, Margao"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              {/* Membership Plan Selection for Professionals */}
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Choose Profile Plan & Placement</span>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Amazon-Style Tiered Ranking
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setSubscriptionTier('free')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      subscriptionTier === 'free'
                        ? 'border-slate-800 bg-white ring-2 ring-slate-800/10'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Free</span>
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">₹0</div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Standard listing ranked organically by rating & reviews.</p>
                  </div>

                  <div
                    onClick={() => setSubscriptionTier('pro')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                      subscriptionTier === 'pro'
                        ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:border-amber-200'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      Popular
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-800">Pro</span>
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">₹299<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                    <p className="text-[10px] text-slate-600 mt-1 leading-tight"><strong className="text-amber-700">SPONSORED</strong> badge, elevated search ranking.</p>
                  </div>

                  <div
                    onClick={() => setSubscriptionTier('premium')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                      subscriptionTier === 'premium'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-slate-50/50 hover:border-indigo-200'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      Top #1
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-900">Premium</span>
                      <Crown className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">₹799<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                    <p className="text-[10px] text-indigo-950 mt-1 leading-tight"><strong>TOP SPONSORED</strong> position on Home page search results.</p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>You will receive <strong>50 Free Lead Credits</strong> immediately to respond to project enquiries!</span>
              </div>
            </div>
          )}

          {selectedRoleForModal === 'supplier' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" /> Supplier Details
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Business / Yard Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mandovi Building Supplies"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Warehouse / Depot Location in Goa</label>
                <input
                  type="text"
                  placeholder="e.g. Verna Industrial Estate / Corlim"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {selectedRoleForModal === 'customer' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Your Project Location in Goa</label>
              <input
                type="text"
                placeholder="e.g. Margao, Salcete or Porvorim"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Registration (Instant Activation)
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              No password required. Your session and role will be active immediately.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
