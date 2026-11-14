import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, ArrowRight, Building2, MapPin, Mail, Info, Navigation, Crosshair } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export const CreateSupplierProfile: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Known Goa Location Coordinates Reference
  const GOA_TOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'verna': { lat: 15.3582, lng: 73.9314 },
    'margao': { lat: 15.2832, lng: 73.9862 },
    'panaji': { lat: 15.4909, lng: 73.8278 },
    'mapusa': { lat: 15.5937, lng: 73.8142 },
    'porvorim': { lat: 15.5353, lng: 73.8291 },
    'vasco': { lat: 15.3995, lng: 73.8122 },
    'ponda': { lat: 15.4026, lng: 74.0086 },
    'bicholim': { lat: 15.5947, lng: 73.9537 },
    'canacona': { lat: 15.0069, lng: 74.0450 }
  };

  // Use subscription tier established during user registration
  const userEstablishedTier = (currentUser?.subscriptionTier || 'pro') as 'free' | 'pro' | 'premium';

  // Form State matching exact user requirements
  const [formData, setFormData] = useState({
    // Business information
    company_name: currentUser?.businessName || '',
    contact_person_name: currentUser?.fullName || '',
    business_type: 'Individual proprietor',
    year_of_establishment: 2018,
    description: '',
    logo_url: '',
    
    // Contact information
    business_email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    alt_phone: '',
    website: '',
    
    // Business location
    state: 'Goa',
    district: currentUser?.locationDistrict || 'South Goa',
    city: currentUser?.city || 'Verna',
    pincode: '403722',
    business_address: '',
    latitude: 15.3582,
    longitude: 73.9314,
    
    // Inherited from registration
    subscription_tier: userEstablishedTier,
    is_sponsored: userEstablishedTier === 'premium' || userEstablishedTier === 'pro',

    // Primary Product
    product_name: 'UltraTech Weather Plus Cement (50kg)',
    product_category: 'Cement',
    indicative_price: 420,
    unit_of_measurement: 'bag',
    primary_image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80'
  });

  const detectSupplierGPS = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsDetecting(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        setGpsDetecting(false);
        setGpsMessage(`Captured live GPS: ${lat}°, ${lng}°`);
      },
      (err) => {
        setGpsDetecting(false);
        // Fallback to Goa town preset
        const cityKey = (formData.city || 'verna').trim().toLowerCase();
        const fallback = GOA_TOWN_COORDINATES[cityKey] || GOA_TOWN_COORDINATES['verna'];
        setFormData(prev => ({
          ...prev,
          latitude: fallback.lat,
          longitude: fallback.lng
        }));
        setGpsMessage(`Using ${formData.city || 'Verna'} coordinates: ${fallback.lat}°, ${fallback.lng}° (${err.message})`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
        const suppData = await res.json();

        // Also add their product
        if (formData.product_name) {
          await fetch(`http://localhost:8000/api/v1/suppliers/${suppData.id}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_name: formData.product_name,
              category: formData.product_category,
              description: `High-quality ${formData.product_category} available for immediate delivery from ${formData.company_name}.`,
              unit_of_measurement: formData.unit_of_measurement,
              indicative_price: Number(formData.indicative_price) || 420,
              in_stock: true,
              delivery_available: true,
              primary_image_url: formData.primary_image_url
            })
          }).catch(() => {});
        }

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

            {/* GPS Yard Coordinates Detector */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-emerald-600" />
                    <span>Depot / Yard GPS Coordinates (for Delivery Estimation)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Used to calculate exact road distance and delivery charges when customers place orders.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={detectSupplierGPS}
                  disabled={gpsDetecting}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{gpsDetecting ? 'Detecting GPS...' : '📍 Auto-Detect Yard GPS'}</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-slate-600">Latitude: <strong className="text-emerald-700">{formData.latitude}° N</strong></span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Longitude: <strong className="text-emerald-700">{formData.longitude}° E</strong></span>
                <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  GPS Active
                </span>
              </div>

              {gpsMessage && (
                <p className="text-[11px] text-emerald-800 font-medium">
                  ✓ {gpsMessage}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Primary Product Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> 4. Primary Product for Marketplace
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Customer Ordering
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UltraTech Weather Plus Cement"
                  value={formData.product_name}
                  onChange={e => handleChange('product_name', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category *</label>
                <select
                  value={formData.product_category}
                  onChange={e => handleChange('product_category', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Cement">Cement</option>
                  <option value="Steel & TMT">Steel & TMT</option>
                  <option value="Stone & Sand">Stone & Sand</option>
                  <option value="Pipes & Plumbing">Pipes & Plumbing</option>
                  <option value="Bricks & Blocks">Bricks & Blocks</option>
                  <option value="Paints & Waterproofing">Paints & Waterproofing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Indicative Price (₹) & Unit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="420"
                    value={formData.indicative_price}
                    onChange={e => handleChange('indicative_price', Number(e.target.value))}
                    className="w-2/3 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="bag / ton / unit"
                    value={formData.unit_of_measurement}
                    onChange={e => handleChange('unit_of_measurement', e.target.value)}
                    className="w-1/3 px-3 py-2 text-sm rounded-xl border border-slate-300 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.primary_image_url}
                  onChange={e => handleChange('primary_image_url', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Marketplace Plan (Read-Only — set during registration) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Info className="w-4 h-4 text-emerald-600" /> 5. Your Marketplace Plan
            </h2>

            <div className={`p-4 rounded-xl border-2 ${
              userEstablishedTier === 'premium'
                ? 'border-indigo-400 bg-indigo-50/60'
                : userEstablishedTier === 'pro'
                  ? 'border-emerald-400 bg-emerald-50/60'
                  : 'border-slate-300 bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-base font-extrabold uppercase ${
                    userEstablishedTier === 'premium'
                      ? 'text-indigo-700'
                      : userEstablishedTier === 'pro'
                        ? 'text-emerald-700'
                        : 'text-slate-700'
                  }`}>
                    {userEstablishedTier === 'premium' ? '👑 Premium' : userEstablishedTier === 'pro' ? '⚡ Pro' : '🛡️ Free'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {userEstablishedTier === 'premium'
                      ? 'TOP SPONSORED placement on Supplier Marketplace — ₹799/mo'
                      : userEstablishedTier === 'pro'
                        ? 'SPONSORED badge & elevated search placement — ₹299/mo'
                        : 'Standard supplier listing in directory — ₹0'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 bg-white/80 border border-slate-200 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  Selected at Registration
                </span>
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
