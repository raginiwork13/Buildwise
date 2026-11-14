import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import type { UserRole, ProfessionalCategory } from '../types';
import { Home, HardHat, Truck, CheckCircle2, Sparkles, X, User, Crown, Zap, Shield, ArrowRight } from 'lucide-react';

export const RegistrationModal: React.FC = () => {
  const { openRegisterModal, setOpenRegisterModal, registerUser, selectedRoleForModal, setSelectedRoleForModal, switchRole } = useUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Customer specific fields
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const customerState = 'Goa';
  const [customerDistrict, setCustomerDistrict] = useState('North Goa');
  const [customerCity, setCustomerCity] = useState('Panaji');
  const [customerPincode, setCustomerPincode] = useState('403001');
  const [customerFullAddress, setCustomerFullAddress] = useState('');
  const [customerType, setCustomerType] = useState('Individual / Homeowner');
  const [customerTier, setCustomerTier] = useState<'free' | 'pro' | 'premium'>('pro');

  // Professional fields
  const [companyName, setCompanyName] = useState('');
  const [professionalCategory, setProfessionalCategory] = useState<ProfessionalCategory>('contractor');
  const [experienceYears, setExperienceYears] = useState(6);
  const [locationDistrict, setLocationDistrict] = useState('North Goa');
  const [city, setCity] = useState('Panaji');
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('pro');

  // Supplier fields
  const [businessName, setBusinessName] = useState('');
  const [contactPersonName] = useState('');
  const [businessType, setBusinessType] = useState('Individual proprietor');
  const [yearOfEstablishment, setYearOfEstablishment] = useState(2018);
  const [supplierDistrict, setSupplierDistrict] = useState('South Goa');
  const [supplierCity, setSupplierCity] = useState('Verna');
  const [supplierPincode] = useState('403722');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierTier, setSupplierTier] = useState<'free' | 'pro' | 'premium'>('pro');
  // Supplier GPS coordinates
  const [supplierLat, setSupplierLat] = useState(15.3582);
  const [supplierLng, setSupplierLng] = useState(73.9314);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  // New Product being sold by supplier
  const [productName, setProductName] = useState('UltraTech Weather Plus Cement (50kg)');
  const [productCategory, setProductCategory] = useState('Cement');
  const [productPrice, setProductPrice] = useState(420);
  const [productUnit, setProductUnit] = useState('bag');
  const [productImageUrl, setProductImageUrl] = useState('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80');

  if (!openRegisterModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setSubmitting(true);

    try {
      if (selectedRoleForModal === 'customer') {
        // Save Customer Profile to Supabase & local state
        const payload = {
          full_name: fullName,
          email: email,
          phone: phone || '+91 98221 00000',
          profile_photo_url: profilePhotoUrl || undefined,
          state: customerState,
          district: customerDistrict,
          city: customerCity,
          pincode: customerPincode,
          full_address: customerFullAddress || undefined,
          customer_type: customerType,
          subscription_tier: customerTier,
          is_sponsored: customerTier === 'premium' || customerTier === 'pro'
        };

        try {
          await fetch('http://localhost:8000/api/v1/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.warn('Backend offline, registered in local session', err);
        }

        await registerUser({
          role: 'customer',
          fullName,
          email,
          phone: phone || '+91 98221 00000',
          city: customerCity,
          locationDistrict: customerDistrict,
          defaultLocation: `${customerCity}, ${customerDistrict}`,
          subscriptionTier: customerTier,
          isSponsored: customerTier === 'premium' || customerTier === 'pro'
        });

        // Navigate directly to Projects page where all customer projects are displayed
        navigate('/projects');

      } else if (selectedRoleForModal === 'supplier') {
        // Save Supplier Profile to Supabase & local state
        const sName = businessName || `${fullName} Building Materials`;
        const payload = {
          company_name: sName,
          contact_person_name: contactPersonName || fullName,
          business_type: businessType,
          year_of_establishment: Number(yearOfEstablishment),
          description: `Authorized supplier of construction materials in ${supplierCity}, ${supplierDistrict}.`,
          business_email: email,
          phone: phone || '+91 98900 12345',
          state: 'Goa',
          district: supplierDistrict,
          city: supplierCity,
          pincode: supplierPincode,
          business_address: supplierAddress || `${supplierCity}, ${supplierDistrict}, Goa`,
          latitude: supplierLat,
          longitude: supplierLng,
          primary_location: `${supplierCity}, ${supplierDistrict}`,
          delivery_locations: ['North Goa', 'South Goa'],
          subscription_tier: supplierTier,
          is_sponsored: supplierTier === 'premium' || supplierTier === 'pro',
          is_published: true
        };

        try {
          const suppRes = await fetch('http://localhost:8000/api/v1/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (suppRes.ok && productName.trim()) {
            const suppData = await suppRes.json();
            // Also register their product in database
            await fetch(`http://localhost:8000/api/v1/suppliers/${suppData.id}/products`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_name: productName,
                category: productCategory,
                description: `High-grade ${productCategory} supplied by ${sName}. Available for home delivery and yard pickup across Goa.`,
                unit_of_measurement: productUnit,
                indicative_price: Number(productPrice) || 400,
                in_stock: true,
                delivery_available: true,
                primary_image_url: productImageUrl
              })
            }).catch(() => { });
          }
        } catch (err) {
          console.warn('Backend offline, registered in local session', err);
        }

        await registerUser({
          role: 'supplier',
          fullName: contactPersonName || fullName,
          email,
          phone: phone || '+91 98900 12345',
          businessName: sName,
          warehouseLocation: `${supplierCity}, ${supplierDistrict}`,
          subscriptionTier: supplierTier,
          isSponsored: supplierTier === 'premium' || supplierTier === 'pro'
        });

        // Navigate to supplier marketplace so user sees their new listing!
        navigate('/suppliers');

      } else {
        // Professional registration
        const pName = companyName || `${fullName} Constructions`;
        const payload = {
          full_name: fullName,
          company_name: pName,
          category: professionalCategory,
          email,
          phone: phone || '+91 98221 00000',
          experience_years: Number(experienceYears),
          district: locationDistrict,
          city,
          subscription_tier: subscriptionTier,
          is_sponsored: subscriptionTier === 'premium' || subscriptionTier === 'pro',
          is_published: true,
          services: [{ service_name: 'Civil Works', pricing_model: 'per_sqft', indicative_rate: 2100 }],
          locations: [{ location_name: city, district: locationDistrict }]
        };

        try {
          await fetch('http://localhost:8000/api/v1/professionals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.warn('Backend offline, registered in local session', err);
        }

        await registerUser({
          role: 'professional',
          fullName,
          email,
          phone: phone || '+91 98221 00000',
          companyName: pName,
          professionalCategory,
          experienceYears: Number(experienceYears),
          locationDistrict,
          city,
          subscriptionTier,
          isSponsored: subscriptionTier === 'premium' || subscriptionTier === 'pro'
        });

        // Navigate to professional marketplace
        navigate('/professionals');
      }
    } finally {
      setSubmitting(false);
      setOpenRegisterModal(false);
    }
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
          <p className="text-slate-300 text-sm mt-1">Select your profile type to store data directly in Supabase.</p>
        </div>

        {/* Quick Demo Pre-fills for Testing */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
          <span className="font-medium flex items-center gap-1">
            ⚡ Quick Demo Switch:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelectDemo('customer')}
              className="hover:underline font-semibold text-amber-800 cursor-pointer"
            >
              Customer
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleQuickSelectDemo('professional')}
              className="hover:underline font-semibold text-amber-800 cursor-pointer"
            >
              Professional
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleQuickSelectDemo('supplier')}
              className="hover:underline font-semibold text-amber-800 cursor-pointer"
            >
              Supplier
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Step 1: Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              1. Choose Profile Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRoleForModal('customer')}
                className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${selectedRoleForModal === 'customer'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${selectedRoleForModal === 'customer' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Customer</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Homeowner, Client</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleForModal('professional')}
                className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${selectedRoleForModal === 'professional'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${selectedRoleForModal === 'professional' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
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
                className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${selectedRoleForModal === 'supplier'
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${selectedRoleForModal === 'supplier' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Market Supplier</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Cement, Steel, Tiles</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Basic Contact Info */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              2. Basic Information
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {selectedRoleForModal === 'supplier' ? 'Primary Contact Person *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Naik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {selectedRoleForModal === 'supplier' ? 'Business Email *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="mt-2.5">
              <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98221 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Step 3A: CUSTOMER SPECIFIC FIELDS */}
          {selectedRoleForModal === 'customer' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-600" /> Customer Profile Details
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer Type *</label>
                <select
                  value={customerType}
                  onChange={e => setCustomerType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Individual / Homeowner">Individual / Homeowner</option>
                  <option value="Property developer">Property developer</option>
                  <option value="Company / Organisation">Company / Organisation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">District in Goa *</label>
                  <select
                    value={customerDistrict}
                    onChange={e => setCustomerDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="North Goa">North Goa</option>
                    <option value="South Goa">South Goa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City / Village *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panaji, Assagao, Margao"
                    value={customerCity}
                    onChange={e => setCustomerCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="403001"
                    value={customerPincode}
                    onChange={e => setCustomerPincode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Profile Photograph URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profilePhotoUrl}
                    onChange={e => setProfilePhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Address (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Plot / House No, Street, Landmark"
                  value={customerFullAddress}
                  onChange={e => setCustomerFullAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Customer Subscription Tier Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Customer Membership Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setCustomerTier('free')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${customerTier === 'free' ? 'border-slate-800 bg-white ring-1 ring-slate-800' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Free (₹0)</span>
                      {customerTier === 'free' && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Post 1 project • Standard bids</div>
                  </div>

                  <div
                    onClick={() => setCustomerTier('pro')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${customerTier === 'pro' ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="font-bold text-xs text-amber-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-600" /> Pro (₹499)
                      </span>
                      {customerTier === 'pro' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Unlimited projects • Fast bids</div>
                  </div>

                  <div
                    onClick={() => setCustomerTier('premium')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${customerTier === 'premium' ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="font-bold text-xs text-indigo-950 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-indigo-600" /> Premium (₹999)
                      </span>
                      {customerTier === 'premium' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-indigo-700 mt-0.5">Dedicated PM • AI Cost review</div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                🔒 <strong>Privacy Note:</strong> Customer profiles are confidential and not listed on public marketplace directories. Membership tier is securely stored in Supabase.
              </p>
            </div>
          )}

          {/* Step 3B: MARKET SUPPLIER SPECIFIC FIELDS */}
          {selectedRoleForModal === 'supplier' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" /> Market Supplier Profile
                </span>
                <button
                  type="button"
                  onClick={() => { setOpenRegisterModal(false); navigate('/suppliers/new'); }}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  Full Wizard <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Business / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandovi Building Supplies"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Business Type</label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Individual proprietor">Individual proprietor</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private limited company">Private limited company</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Est. Year</label>
                  <input
                    type="number"
                    value={yearOfEstablishment}
                    onChange={e => setYearOfEstablishment(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                  <select
                    value={supplierDistrict}
                    onChange={e => setSupplierDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="South Goa">South Goa</option>
                    <option value="North Goa">North Goa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City / Village *</label>
                  <input
                    type="text"
                    required
                    placeholder="Verna, Margao"
                    value={supplierCity}
                    onChange={e => setSupplierCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Complete Business Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 42, Verna Industrial Estate"
                  value={supplierAddress}
                  onChange={e => setSupplierAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* GPS Depot Coordinates Button */}
              <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800">
                    📍 Yard GPS Coordinates (Delivery Costing)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      setDetectingGps(true);
                      navigator.geolocation.getCurrentPosition(
                        pos => {
                          const lat = parseFloat(pos.coords.latitude.toFixed(6));
                          const lng = parseFloat(pos.coords.longitude.toFixed(6));
                          setSupplierLat(lat);
                          setSupplierLng(lng);
                          setDetectingGps(false);
                          setGpsSuccessMsg(`GPS set: ${lat}°, ${lng}°`);
                        },
                        () => {
                          setDetectingGps(false);
                          setGpsSuccessMsg('Set to Goa Verna depot default');
                        },
                        { timeout: 8000 }
                      );
                    }}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    {detectingGps ? 'Locating...' : '📍 Auto-Detect GPS'}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-slate-600 flex justify-between items-center">
                  <span>{supplierLat}° N, {supplierLng}° E</span>
                  {gpsSuccessMsg && <span className="text-emerald-700 font-bold">{gpsSuccessMsg}</span>}
                </div>
              </div>

              {/* Supplier Product Input: Cement, Steel, Sand, etc. */}
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Primary Product for Marketplace
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UltraTech Weather Plus Cement"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Category *</label>
                    <select
                      value={productCategory}
                      onChange={e => setProductCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="Cement">Cement</option>
                      <option value="Steel & TMT">Steel & TMT</option>
                      <option value="Stone & Sand">Stone & Sand</option>
                      <option value="Pipes & Plumbing">Pipes & Plumbing</option>
                      <option value="Bricks & Blocks">Bricks & Blocks</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Price (₹) & Unit *</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="420"
                        value={productPrice}
                        onChange={e => setProductPrice(Number(e.target.value))}
                        className="w-2/3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="bag"
                        value={productUnit}
                        onChange={e => setProductUnit(e.target.value)}
                        className="w-1/3 px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Product Photo URL (optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={productImageUrl}
                      onChange={e => setProductImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Supplier Visibility Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setSupplierTier('free')}
                    className={`p-2 rounded-xl border-2 cursor-pointer ${supplierTier === 'free' ? 'border-slate-800 bg-white' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Free (₹0)</div>
                    <div className="text-[10px] text-slate-500">Standard listing</div>
                  </div>
                  <div
                    onClick={() => setSupplierTier('pro')}
                    className={`p-2 rounded-xl border-2 cursor-pointer ${supplierTier === 'pro' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="font-bold text-xs text-emerald-800">Pro (₹299/mo)</div>
                    <div className="text-[10px] text-emerald-700">Sponsored badge</div>
                  </div>
                  <div
                    onClick={() => setSupplierTier('premium')}
                    className={`p-2 rounded-xl border-2 cursor-pointer ${supplierTier === 'premium' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    <div className="font-bold text-xs text-indigo-900">Premium (₹799/mo)</div>
                    <div className="text-[10px] text-indigo-700">Top ranking</div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                ✨ <strong>Marketplace Integration:</strong> Your supplier profile will be listed directly in the <strong>Supplier Marketplace</strong>!
              </p>
            </div>
          )}

          {/* Step 3C: PROFESSIONAL SPECIFIC FIELDS */}
          {selectedRoleForModal === 'professional' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-600" /> Professional Details
                </span>
                <button
                  type="button"
                  onClick={() => { setOpenRegisterModal(false); navigate('/professionals/new'); }}
                  className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
                >
                  Full 5-Step Wizard <ArrowRight className="w-3 h-3" />
                </button>
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Experience</label>
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
                  <span>Choose Profile Plan</span>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Amazon-Style Tiered Ranking
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setSubscriptionTier('free')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${subscriptionTier === 'free'
                        ? 'border-slate-800 bg-white ring-2 ring-slate-800/10'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Free</span>
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">₹0</div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">Standard organic ranking.</p>
                  </div>

                  <div
                    onClick={() => setSubscriptionTier('pro')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all relative ${subscriptionTier === 'pro'
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
                    <p className="text-[10px] text-slate-600 mt-1 leading-tight"><strong className="text-amber-700">SPONSORED</strong> badge.</p>
                  </div>

                  <div
                    onClick={() => setSubscriptionTier('premium')}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all relative ${subscriptionTier === 'premium'
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
                    <p className="text-[10px] text-indigo-950 mt-1 leading-tight"><strong>TOP SPONSORED</strong> on Home page.</p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>You will receive <strong>50 Free Lead Credits</strong> immediately!</span>
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Saving to Supabase & Activating...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedRoleForModal === 'customer'
                      ? 'Save Customer Profile & Activate'
                      : selectedRoleForModal === 'supplier'
                        ? 'Publish Supplier Profile & View in Marketplace'
                        : 'Publish Professional Profile & View in Marketplace'}
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              No password required. Profile is saved to Supabase and instantly active.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
