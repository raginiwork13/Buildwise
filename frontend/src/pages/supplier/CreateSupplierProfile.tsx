import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, ArrowRight, Shield, Zap, Crown, Building2, MapPin, Mail, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export const CreateSupplierProfile: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State matching exact user requirements
  const [formData, setFormData] = useState({
    // Business information
    company_name: '',
    contact_person_name: '',
    business_type: 'Individual proprietor',
    year_of_establishment: 2018,
    description: '',
    logo_url: '',
    
    // Contact information
    business_email: '',
    phone: '',
    alt_phone: '',
    website: '',
    
    // Business location
    state: 'Goa',
    district: 'South Goa',
    city: 'Verna',
    pincode: '403722',
    business_address: '',
    
    // Marketplace tier
    subscription_tier: 'pro' as 'free' | 'pro' | 'premium',
    is_sponsored: true
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'subscription_tier' ? { is_sponsored: value === 'premium' || value === 'pro' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.business_email.trim() || !formData.phone.trim()) {
      setError('Please fill in Company Name, Business Email, and Mobile Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        primary_location: `${formData.city}, ${formData.district}`,
        delivery_locations: ['North Goa', 'South Goa'],
        is_published: true
      };

      const res = await fetch('http://localhost:8000/api/v1/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await res.json();
        // Update user session
        registerUser({
          role: 'supplier',
          fullName: formData.contact_person_name || formData.company_name,
          email: formData.business_email,
          phone: formData.phone,
          businessName: formData.company_name,
          warehouseLocation: `${formData.city}, ${formData.district}`,
          subscriptionTier: formData.subscription_tier,
          isSponsored: formData.is_sponsored
        });

        // Navigate to supplier marketplace so they see their listing!
        navigate('/suppliers');
      } else {
        // Local fallback
        registerUser({
          role: 'supplier',
          fullName: formData.contact_person_name || formData.company_name,
          email: formData.business_email,
          phone: formData.phone,
          businessName: formData.company_name,
          warehouseLocation: `${formData.city}, ${formData.district}`,
          subscriptionTier: formData.subscription_tier,
          isSponsored: formData.is_sponsored
        });
        navigate('/suppliers');
      }
    } catch {
      // Local fallback if backend isn't reached
      registerUser({
        role: 'supplier',
        fullName: formData.contact_person_name || formData.company_name,
        email: formData.business_email,
        phone: formData.phone,
        businessName: formData.company_name,
        warehouseLocation: `${formData.city}, ${formData.district}`,
        subscriptionTier: formData.subscription_tier,
        isSponsored: formData.is_sponsored
      });
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-900/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Supplier Marketplace Registration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Register Your Building Materials Business</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            List your business on Goa's construction supplier marketplace with no login barriers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          
          {/* Section 1: Business Information */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-emerald-600" /> 1. Business Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandovi Building Solutions & Steel Yard"
                  value={formData.company_name}
                  onChange={e => handleChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Owner / Primary Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kamat"
                  value={formData.contact_person_name}
                  onChange={e => handleChange('contact_person_name', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Type</label>
                <select
                  value={formData.business_type}
                  onChange={e => handleChange('business_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Individual proprietor">Individual proprietor</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private limited company">Private limited company</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Establishment</label>
                <input
                  type="number"
                  min="1950"
                  max="2026"
                  placeholder="2018"
                  value={formData.year_of_establishment}
                  onChange={e => handleChange('year_of_establishment', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Description</label>
              <textarea
                rows={3}
                placeholder="Describe your products (cement, TMT steel, laterite stone, tiles, plumbing, electricals), warehouse capacity, and delivery fleet across Goa..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Logo URL (optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={formData.logo_url}
                onChange={e => handleChange('logo_url', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-4 h-4 text-emerald-600" /> 2. Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email *</label>
                <input
                  type="email"
                  required
                  placeholder="sales@mandovibuilding.in"
                  value={formData.business_email}
                  onChange={e => handleChange('business_email', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98900 12345"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alternative Contact Number (optional)</label>
                <input
                  type="tel"
                  placeholder="+91 832 2780000"
                  value={formData.alt_phone}
                  onChange={e => handleChange('alt_phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website (optional)</label>
                <input
                  type="url"
                  placeholder="https://mandovibuilding.in"
                  value={formData.website}
                  onChange={e => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Business Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> 3. Business Location in Goa
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  disabled
                  value={formData.state}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                <select
                  value={formData.district}
                  onChange={e => handleChange('district', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="North Goa">North Goa</option>
                  <option value="South Goa">South Goa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Village *</label>
                <input
                  type="text"
                  required
                  placeholder="Verna, Margao, Panaji"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  placeholder="403722"
                  value={formData.pincode}
                  onChange={e => handleChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Business Address</label>
              <textarea
                rows={2}
                placeholder="e.g. Plot 42, Phase II, Verna Industrial Estate, South Goa"
                value={formData.business_address}
                onChange={e => handleChange('business_address', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Subscription Tier Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> 4. Supplier Marketplace Plan
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Tiered Visibility
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => handleChange('subscription_tier', 'free')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.subscription_tier === 'free'
                    ? 'border-slate-800 bg-white ring-2 ring-slate-800/10'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">Free</span>
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-base font-extrabold text-slate-900">₹0</div>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">Standard supplier listing in directory.</p>
              </div>

              <div
                onClick={() => handleChange('subscription_tier', 'pro')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                  formData.subscription_tier === 'pro'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-emerald-200'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Popular
                </span>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-800">Pro</span>
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-base font-extrabold text-slate-900">₹299<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                <p className="text-[11px] text-emerald-950 mt-1 leading-tight"><strong className="text-emerald-700">SPONSORED</strong> badge, elevated search placement.</p>
              </div>

              <div
                onClick={() => handleChange('subscription_tier', 'premium')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                  formData.subscription_tier === 'premium'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-indigo-200'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  Top #1
                </span>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-900">Premium</span>
                  <Crown className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-base font-extrabold text-slate-900">₹799<span className="text-[10px] font-normal text-slate-500">/mo</span></div>
                <p className="text-[11px] text-indigo-950 mt-1 leading-tight"><strong>TOP SPONSORED</strong> placement on Supplier Marketplace.</p>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Supplier Profile & Saving to Supabase...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Profile & List on Supplier Marketplace</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
