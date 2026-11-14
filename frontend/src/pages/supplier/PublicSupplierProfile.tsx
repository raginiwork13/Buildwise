import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { SupplierProfileFull } from '../../types/profile';
import { VerificationBadge } from '../../components/profile/VerificationBadge';
import { ProductCard } from '../../components/supplier/ProductCard';
import { MapPin, Mail, Phone, Globe, Package, ChevronRight, PlusCircle, Crown, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { OrderProductModal } from '../../components/supplier/OrderProductModal';
import type { OrderModalProduct } from '../../components/supplier/OrderProductModal';
import { ViewOrdersModal } from '../../components/supplier/ViewOrdersModal';
import { ChangePlanModal } from '../../components/subscription/ChangePlanModal';

export const PublicSupplierProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role, currentUser } = useUser();
  const isSupplier = role === 'supplier';
  const [supplier, setSupplier] = useState<SupplierProfileFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<OrderModalProduct | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showViewOrdersModal, setShowViewOrdersModal] = useState(false);

  // Add Product Modal & Limit Control
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Cement');
  const [newProductPrice, setNewProductPrice] = useState(450);
  const [newProductUnit, setNewProductUnit] = useState('per bag');
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80');
  const [addingProduct, setAddingProduct] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/suppliers/${id || 'supp-mandovi-1'}`);
        if (res.ok) {
          const data = await res.json();
          setSupplier(data);
        } else {
          setSupplier(fallbackSupplier);
        }
      } catch {
        setSupplier(fallbackSupplier);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const isOwner = currentUser?.email.toLowerCase() === supplier?.business_email.toLowerCase() || isSupplier;
  const supplierTier = (supplier?.subscription_tier || 'free').toLowerCase();
  const isFreeTier = supplierTier === 'free';
  const productCount = supplier?.products?.length || 0;
  const hasReachedFreeLimit = isFreeTier && productCount >= 1;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !supplier) return;

    if (hasReachedFreeLimit) {
      setShowAddProductModal(false);
      setShowUpgradePlanModal(true);
      return;
    }

    setAddingProduct(true);
    setAddError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/suppliers/${supplier.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: newProductName,
          category: newProductCategory,
          description: `High-quality ${newProductCategory} supplied by ${supplier.company_name}. Available across Goa.`,
          indicative_price: Number(newProductPrice) || 450,
          unit_of_measurement: newProductUnit,
          primary_image_url: newProductImage,
          in_stock: true,
          delivery_available: true
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setShowAddProductModal(false);
          setShowUpgradePlanModal(true);
          return;
        }
        throw new Error(errData.detail || 'Failed to add product');
      }

      const createdProd = await res.json();
      setSupplier(prev => prev ? { ...prev, products: [...prev.products, createdProd] } : prev);
      setShowAddProductModal(false);
      setNewProductName('');
    } catch (err: any) {
      setAddError(err.message || 'Error creating product');
    } finally {
      setAddingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading supplier catalogue...</p>
        </div>
      </div>
    );
  }

  if (!supplier) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <a href="/#materials" className="hover:text-emerald-600">Suppliers</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold">{supplier.company_name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900" />

          <div className="px-6 sm:px-10 pb-8 relative -mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">

              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <img
                  src={supplier.logo_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=200&q=80'}
                  alt={supplier.company_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                />

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{supplier.company_name}</h1>
                    <VerificationBadge status={supplier.verification_status} showPendingNotice />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{supplier.primary_location}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${supplier.phone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Contact Supplier
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Content: Description & Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>Materials & Product Catalogue ({supplier.products.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFreeTier ? (
                    <span className="text-amber-700 font-semibold">
                      Free Plan limit: 1 Product Maximum ({productCount}/1 listed)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">
                      ✨ {supplierTier.toUpperCase()} Plan: Unlimited Product Listings Active
                    </span>
                  )}
                </p>
              </div>

              {/* Add Product Button (Owner / Supplier) */}
              {isOwner && (
                <div>
                  {hasReachedFreeLimit ? (
                    <button
                      onClick={() => setShowUpgradePlanModal(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Upgrade to List More Products</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAddProductModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {supplier.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {supplier.products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOrderClick={!isSupplier ? (p) => {
                      setSelectedProductForOrder({
                        ...p,
                        supplier_id: supplier.id,
                        supplier_name: supplier.company_name,
                        supplier_address: supplier.business_address || supplier.primary_location || 'Goa',
                        supplier_latitude: supplier.latitude || 15.3582,
                        supplier_longitude: supplier.longitude || 73.9314
                      });
                      setShowOrderModal(true);
                    } : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No products added yet.
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Supplier Overview</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{supplier.description}</p>

              {supplier.delivery_locations.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Delivery Radius in Goa
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {supplier.delivery_locations.map((loc, i) => (
                      <span key={i} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">Vendor Depot Contact</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{supplier.business_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{supplier.phone}</span>
                </div>
                {supplier.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <a href={supplier.website} target="_blank" rel="noreferrer" className="hover:underline text-emerald-400">
                      {supplier.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* --- ORDER MODAL --- */}
      <OrderProductModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedProductForOrder(null);
        }}
        product={selectedProductForOrder}
        onOrderSuccess={() => {
          setTimeout(() => setShowViewOrdersModal(true), 300);
        }}
      />

      {/* --- VIEW ORDERS MODAL --- */}
      <ViewOrdersModal
        isOpen={showViewOrdersModal}
        onClose={() => setShowViewOrdersModal(false)}
      />

      {/* --- ADD PRODUCT MODAL --- */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">List New Material / Product</h3>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Tiscon 550D TMT Steel 12mm"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={newProductCategory}
                    onChange={e => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cement">Cement</option>
                    <option value="Steel">Steel & Rebar</option>
                    <option value="Laterite Stone">Goan Laterite Stone</option>
                    <option value="Aggregates">Sand & Aggregates</option>
                    <option value="Tiles">Tiles & Terrazzo</option>
                    <option value="Plumbing">Plumbing & Pipes</option>
                    <option value="Paint">Paint & Waterproofing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Unit of Measurement</label>
                <input
                  type="text"
                  placeholder="e.g. per 50kg bag, per metric ton, per piece"
                  value={newProductUnit}
                  onChange={e => setNewProductUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newProductImage}
                  onChange={e => setNewProductImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  {addingProduct ? 'Adding...' : 'Save & Publish Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPGRADE PLAN MODAL (WHEN FREE SUPPLIER REACHES 1 PRODUCT LIMIT) --- */}
      <ChangePlanModal
        isOpen={showUpgradePlanModal}
        onClose={() => setShowUpgradePlanModal(false)}
      />

    </div>
  );
};

const fallbackSupplier: SupplierProfileFull = {
  id: 'supp-mandovi-1',
  company_name: 'Mandovi Building Solutions & Steel Yard',
  logo_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=100&q=80',
  description: "Goa's premier distributor of UltraTech Weather Plus Cement, Tata Tiscon 550D TMT rebar, sand, and locally quarried laterite stones.",
  business_email: 'mandovi.supplies@gmail.com',
  phone: '+91 98900 12345',
  website: 'https://mandovibuilding.in',
  primary_location: 'Verna Industrial Estate, South Goa',
  delivery_locations: ['North Goa', 'South Goa', 'Panaji', 'Margao', 'Vasco', 'Mapusa'],
  is_published: true,
  profile_completion_pct: 100,
  verification_status: 'verified',
  categories: [{ category_name: 'Cement' }, { category_name: 'Steel' }],
  products: [
    {
      id: 'prod-1',
      product_name: 'UltraTech Weather Plus Cement (PPC)',
      category: 'Cement',
      brand: 'UltraTech',
      description: 'Water-repellent Portland Pozzolana Cement formulated for coastal Goan humidity and high rain resistance.',
      specifications: '50kg HDPE Bag · IS 1489 Part 1 compliant',
      unit_of_measurement: 'per 50kg bag',
      indicative_price: 385.0,
      currency: 'INR',
      in_stock: true,
      delivery_available: true,
      primary_image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80'
    }
  ]
};
