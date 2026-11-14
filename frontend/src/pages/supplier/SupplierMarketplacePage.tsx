import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Search, MapPin, Phone, Mail, CheckCircle2, Crown, Zap, Building2, ExternalLink, ShoppingBag, Package } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { OrderProductModal } from '../../components/supplier/OrderProductModal';
import type { OrderModalProduct } from '../../components/supplier/OrderProductModal';
import { ViewOrdersModal } from '../../components/supplier/ViewOrdersModal';

interface SupplierItem {
  id: string;
  company_name: string;
  contact_person_name?: string;
  business_type?: string;
  year_of_establishment?: number;
  description: string;
  logo_url?: string;
  business_email: string;
  phone: string;
  alt_phone?: string;
  website?: string;
  state: string;
  district: string;
  city: string;
  pincode?: string;
  business_address?: string;
  latitude?: number;
  longitude?: number;
  primary_location: string;
  delivery_locations: string[];
  subscription_tier?: 'free' | 'pro' | 'premium';
  is_sponsored?: boolean;
  products?: any[];
}

export const SupplierMarketplacePage: React.FC = () => {
  const { role } = useUser();
  const isSupplier = role === 'supplier';
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Order modals
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<OrderModalProduct | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showViewOrdersModal, setShowViewOrdersModal] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch {
      // Fallback data
      setSuppliers([
        {
          id: 'supp-mandovi-1',
          company_name: 'Mandovi Building Solutions & Steel Yard',
          contact_person_name: 'Anand Kamat',
          business_type: 'Private limited company',
          year_of_establishment: 2012,
          description: "Goa's premier distributor of UltraTech Weather Plus Cement, Tata Tiscon 550D TMT rebar, sand, and locally quarried laterite stones.",
          logo_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=100&q=80',
          business_email: 'mandovi.supplies@gmail.com',
          phone: '+91 98900 12345',
          state: 'Goa',
          district: 'South Goa',
          city: 'Verna',
          pincode: '403722',
          business_address: 'Plot 42, Phase II, Verna Industrial Estate, Goa',
          primary_location: 'Verna Industrial Estate, South Goa',
          delivery_locations: ['North Goa', 'South Goa', 'Panaji', 'Margao'],
          subscription_tier: 'premium',
          is_sponsored: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    if (districtFilter !== 'all' && s.district !== districtFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = s.company_name.toLowerCase().includes(q);
      const descMatch = (s.description || '').toLowerCase().includes(q);
      const cityMatch = (s.city || '').toLowerCase().includes(q);
      return nameMatch || descMatch || cityMatch;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-3.5 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1.5 mb-3">
              <Truck className="w-3.5 h-3.5" /> Goa Building Materials Marketplace
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Direct Sourcing from Goa's Verified Suppliers
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Connect directly with authorized distributors of cement, Tata Tiscon TMT steel, Goan laterite stone, tiles, and plumbing supplies across North and South Goa.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/suppliers/new"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Truck className="w-4 h-4" />
                <span>List Your Business as Supplier</span>
              </Link>

              {/* View Orders Button — Accessible to Suppliers, Customers and Pros */}
              <button
                onClick={() => setShowViewOrdersModal(true)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all backdrop-blur-sm cursor-pointer"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>{isSupplier ? 'View Customer Orders & Shipments' : 'View Your Material Orders'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search cement, steel, supplier name, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">District:</span>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Goa Districts</option>
              <option value="North Goa">North Goa</option>
              <option value="South Goa">South Goa</option>
            </select>
          </div>
        </div>

        {/* Supplier Cards Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading verified suppliers from Supabase...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Suppliers Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or district filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setDistrictFilter('all'); }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supp) => {
              const isPremium = supp.subscription_tier === 'premium';
              const isPro = supp.subscription_tier === 'pro';

              return (
                <div
                  key={supp.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${isPremium
                      ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                      : isPro
                        ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                        : 'border-slate-200'
                    }`}
                >
                  <div className="p-6 space-y-4">

                    {/* Header: Logo, Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {supp.logo_url ? (
                          <img
                            src={supp.logo_url}
                            alt={supp.company_name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-200 shrink-0">
                            {supp.company_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                            {supp.company_name}
                          </h3>
                          {supp.contact_person_name && (
                            <p className="text-xs text-slate-500">Contact: {supp.contact_person_name}</p>
                          )}
                        </div>
                      </div>

                      {/* Tier Badge */}
                      {isPremium && (
                        <span className="shrink-0 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase tracking-wide">
                          <Crown className="w-3 h-3" /> Top Sponsored
                        </span>
                      )}
                      {isPro && !isPremium && (
                        <span className="shrink-0 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase tracking-wide">
                          <Zap className="w-3 h-3" /> Sponsored
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {supp.description || 'Verified supplier of high-grade construction materials across Goa.'}
                    </p>

                    {/* Meta Tags */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{supp.city}, {supp.district}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{supp.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{supp.business_email}</span>
                      </div>
                    </div>

                    {/* Business Details Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {supp.business_type && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                          {supp.business_type}
                        </span>
                      )}
                      {supp.year_of_establishment && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                          Est. {supp.year_of_establishment}
                        </span>
                      )}
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Yard
                      </span>
                    </div>

                    {/* Featured Products Showcase & Quick Order */}
                    {supp.products && supp.products.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Featured Material Available:
                        </span>
                        {supp.products.slice(0, 2).map((p: any) => (
                          <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={p.primary_image_url || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=100&q=80'}
                                alt={p.product_name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">{p.product_name}</div>
                                <div className="text-[10px] text-emerald-700 font-extrabold">₹{p.indicative_price} / {p.unit_of_measurement || 'unit'}</div>
                              </div>
                            </div>

                            {!isSupplier && (
                              <button
                                onClick={() => {
                                  setSelectedProductForOrder({
                                    ...p,
                                    supplier_name: supp.company_name,
                                    supplier_address: supp.business_address || `${supp.city}, ${supp.district}`,
                                    supplier_latitude: supp.latitude || 15.3582,
                                    supplier_longitude: supp.longitude || 73.9314
                                  });
                                  setShowOrderModal(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer shrink-0 shadow-2xs"
                              >
                                Order
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Card Footer CTA */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {!isSupplier && (
                      <button
                        onClick={() => {
                          setSelectedProductForOrder({
                            product_name: `${supp.company_name} - Direct Material Dispatch`,
                            category: 'Cement & Building Supplies',
                            indicative_price: 420,
                            unit_of_measurement: 'bag / unit',
                            primary_image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80',
                            supplier_id: supp.id,
                            supplier_name: supp.company_name,
                            supplier_address: supp.business_address || `${supp.city}, ${supp.district}`,
                            supplier_latitude: supp.latitude || 15.3582,
                            supplier_longitude: supp.longitude || 73.9314
                          });
                          setShowOrderModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Materials</span>
                      </button>
                    )}

                    <Link
                      to={`/suppliers/${supp.id}`}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Catalogue</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* --- ORDER MATERIAL MODAL --- */}
      <OrderProductModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedProductForOrder(null);
        }}
        product={selectedProductForOrder}
        onOrderSuccess={() => {
          // Open the order tracking view after placing order
          setTimeout(() => setShowViewOrdersModal(true), 300);
        }}
      />

      {/* --- VIEW ORDERS & SHIPMENTS MODAL --- */}
      <ViewOrdersModal
        isOpen={showViewOrdersModal}
        onClose={() => setShowViewOrdersModal(false)}
      />

    </div>
  );
};
