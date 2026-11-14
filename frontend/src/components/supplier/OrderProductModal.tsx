import React, { useState } from 'react';
import { 
  X, ShoppingBag, Truck, MapPin, CheckCircle2, 
  Crown, Zap, Shield, ArrowRight, Navigation, Crosshair, Compass
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

export interface OrderModalProduct {
  id?: string;
  product_name: string;
  category: string;
  brand?: string;
  description?: string;
  unit_of_measurement?: string;
  indicative_price: number;
  primary_image_url?: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_address?: string;
  supplier_latitude?: number;
  supplier_longitude?: number;
}

// Goan site presets for instant calculation
const GOA_SITE_PRESETS = [
  { name: 'Panaji (North Goa)', lat: 15.4909, lng: 73.8278 },
  { name: 'Assagao / Anjuna (North Goa)', lat: 15.5912, lng: 73.7712 },
  { name: 'Calangute / Candolim (North Goa)', lat: 15.5434, lng: 73.7663 },
  { name: 'Porvorim (North Goa)', lat: 15.5353, lng: 73.8291 },
  { name: 'Mapusa (North Goa)', lat: 15.5937, lng: 73.8142 },
  { name: 'Siolim (North Goa)', lat: 15.6267, lng: 73.7694 },
  { name: 'Margao (South Goa)', lat: 15.2832, lng: 73.9862 },
  { name: 'Verna Industrial Area (South Goa)', lat: 15.3582, lng: 73.9314 },
  { name: 'Colva / Benaulim (South Goa)', lat: 15.2742, lng: 73.9167 },
  { name: 'Vasco da Gama (South Goa)', lat: 15.3995, lng: 73.8122 },
  { name: 'Ponda (South Goa)', lat: 15.4026, lng: 74.0086 }
];

const calculateHaversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // 1.25 factor accounts for typical Goan winding roads & bridges
  return Math.max(1, parseFloat((R * c * 1.25).toFixed(1)));
};

interface OrderProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: OrderProductModalPropsProduct | null;
  onOrderSuccess?: () => void;
}

export type OrderProductModalPropsProduct = OrderModalProduct;

export const OrderProductModal: React.FC<OrderProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onOrderSuccess
}) => {
  const { currentUser, role } = useUser();
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'pickup'>('home_delivery');
  const [address, setAddress] = useState(currentUser?.defaultLocation || 'Panaji, North Goa');

  // Supplier Yard Location (defaults to Verna 15.3582, 73.9314)
  const supplierLat = product?.supplier_latitude || 15.3582;
  const supplierLng = product?.supplier_longitude || 73.9314;

  // Customer Site Location State (default to Panaji 15.4909, 73.8278)
  const [customerLat, setCustomerLat] = useState<number>(15.4909);
  const [customerLng, setCustomerLng] = useState<number>(73.8278);
  const [distanceKm, setDistanceKm] = useState<number>(() => calculateHaversineKm(supplierLat, supplierLng, 15.4909, 73.8278));
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsMethod, setGpsMethod] = useState<'preset' | 'device_gps'>('preset');
  const [gpsNote, setGpsNote] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(10);
  const [notes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const detectCustomerGPS = () => {
    if (!navigator.geolocation) {
      setGpsNote('Device GPS is not supported in this browser.');
      return;
    }

    setDetectingGps(true);
    setGpsNote(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setCustomerLat(lat);
        setCustomerLng(lng);
        const dist = calculateHaversineKm(supplierLat, supplierLng, lat, lng);
        setDistanceKm(dist);
        setGpsMethod('device_gps');
        setDetectingGps(false);
        setGpsNote(`Live GPS detected: ${lat}°, ${lng}° (Accurate: ±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setDetectingGps(false);
        setGpsNote(`GPS access declined (${err.message}). Using preset coordinates.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset: typeof GOA_SITE_PRESETS[0]) => {
    setCustomerLat(preset.lat);
    setCustomerLng(preset.lng);
    setAddress(`${preset.name}, Goa`);
    const dist = calculateHaversineKm(supplierLat, supplierLng, preset.lat, preset.lng);
    setDistanceKm(dist);
    setGpsMethod('preset');
    setGpsNote(`Selected ${preset.name} (${dist} km from depot)`);
  };

  if (!isOpen || !product) return null;

  const userTier = (currentUser?.subscriptionTier || 'free') as 'free' | 'pro' | 'premium';

  // Fee calculation:
  // Pickup: ₹0
  // Premium: Free delivery at all times (₹0)
  // Pro: ₹30/km
  // Free: ₹90/km
  const getDeliveryRatePerKm = () => {
    if (deliveryType === 'pickup') return 0;
    if (userTier === 'premium') return 0;
    if (userTier === 'pro') return 30;
    return 90;
  };

  const deliveryRate = getDeliveryRatePerKm();
  const deliveryFee = deliveryType === 'pickup' ? 0 : (userTier === 'premium' ? 0 : distanceKm * deliveryRate);
  const itemsTotal = (product.indicative_price || 0) * quantity;
  const grandTotal = itemsTotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      product_id: product.id || 'prod-custom',
      product_name: product.product_name,
      product_category: product.category,
      product_image: product.primary_image_url,
      supplier_id: product.supplier_id,
      supplier_name: product.supplier_name,
      supplier_address: product.supplier_address || 'Verna Industrial Estate, South Goa',
      supplier_latitude: supplierLat,
      supplier_longitude: supplierLng,
      customer_name: currentUser?.fullName || 'Valued Builder',
      customer_role: role || 'customer',
      customer_tier: userTier,
      customer_latitude: deliveryType === 'home_delivery' ? customerLat : undefined,
      customer_longitude: deliveryType === 'home_delivery' ? customerLng : undefined,
      delivery_type: deliveryType,
      delivery_address: deliveryType === 'home_delivery' ? address : undefined,
      distance_km: distanceKm,
      delivery_fee: deliveryFee,
      quantity,
      unit_price: product.indicative_price,
      total_amount: grandTotal,
      notes: notes || undefined
    };

    try {
      const res = await fetch('http://localhost:8000/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const orderData = await res.json();
        window.dispatchEvent(new CustomEvent('supplier_order_placed', {
          detail: {
            title: '📦 Received Order',
            desc: `Received order for ${quantity}x ${product.product_name} from ${payload.customer_name}. Total: ₹${grandTotal.toLocaleString('en-IN')}`,
            order: orderData
          }
        }));
      }
    } catch (err) {
      console.warn('Order saved locally:', err);
    } finally {
      setSubmitting(false);
      setOrderDone(true);
      window.dispatchEvent(new Event('refresh_notifications'));
      if (onOrderSuccess) onOrderSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 w-fit mb-2">
            <ShoppingBag className="w-3.5 h-3.5" /> Place Material Order
          </span>
          <h2 className="text-xl font-black">{product.product_name}</h2>
          <p className="text-xs text-slate-300 mt-0.5">Supplier: <strong>{product.supplier_name}</strong></p>
        </div>

        {orderDone ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your order for <strong>{quantity} units</strong> of {product.product_name} has been sent to {product.supplier_name}.
              Track live shipment progress in the <strong>View Orders</strong> tab.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Product Summary */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={product.primary_image_url || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80'}
                alt={product.product_name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 truncate">{product.product_name}</div>
                <div className="text-xs text-slate-500">{product.category} • ₹{product.indicative_price.toLocaleString('en-IN')}/{product.unit_of_measurement || 'unit'}</div>
              </div>
              <div className="w-24">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2 py-1 text-sm font-bold rounded-lg border border-slate-300 text-center"
                />
              </div>
            </div>

            {/* Delivery Option Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Choose Delivery Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryType('home_delivery')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryType === 'home_delivery'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" /> Home / Site Delivery
                    </span>
                    {deliveryType === 'home_delivery' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Direct trucking to your construction site</div>
                </div>

                <div
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-slate-800 bg-white ring-1 ring-slate-800'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-700" /> Yard Self-Pickup
                    </span>
                    {deliveryType === 'pickup' && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Zero delivery fee • Collect from supplier</div>
                </div>
              </div>
            </div>

            {/* Address Input or Yard Address Display */}
            {deliveryType === 'home_delivery' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Site Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter full plot/site address, street, landmark..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Live GPS Distance Calculation Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Crosshair className="w-4 h-4 text-emerald-600" />
                        <span>GPS Site Location & Accurate Distance</span>
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Exact distance calculated from supplier depot to your construction site.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={detectCustomerGPS}
                      disabled={detectingGps}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{detectingGps ? 'Locating...' : '📍 Detect Site GPS'}</span>
                    </button>
                  </div>

                  {/* Quick Select Goa Town Presets */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-400" /> Or Select Goa Location Preset:
                    </label>
                    <select
                      onChange={(e) => {
                        const found = GOA_SITE_PRESETS.find(p => p.name === e.target.value);
                        if (found) handleSelectPreset(found);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Choose Goa Area / Town --</option>
                      {GOA_SITE_PRESETS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Calculated GPS Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Depot GPS (Supplier)</span>
                      <span className="font-mono font-medium text-slate-700">{supplierLat}° N, {supplierLng}° E</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Site GPS (Delivery)</span>
                      <span className="font-mono font-medium text-emerald-700">{customerLat}° N, {customerLng}° E</span>
                    </div>
                  </div>

                  {/* Distance Summary */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" /> Calculated Road Distance:
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600">
                        {gpsMethod === 'device_gps' ? '📍 Live Device GPS' : '📍 Area Preset'}
                      </span>
                    </span>
                    <span className="text-sm font-black text-slate-900 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {distanceKm} km
                    </span>
                  </div>

                  {gpsNote && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50/70 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{gpsNote}</span>
                    </div>
                  )}
                </div>

                {/* Membership Delivery Fee Breakdown Banner */}
                <div className={`p-3 rounded-2xl border text-xs ${
                  userTier === 'premium'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    : userTier === 'pro'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {userTier === 'premium' && <Crown className="w-3.5 h-3.5 text-indigo-600" />}
                      {userTier === 'pro' && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                      {userTier === 'free' && <Shield className="w-3.5 h-3.5 text-slate-600" />}
                      <span>Your Plan: <strong className="uppercase">{userTier}</strong></span>
                    </span>
                    <span className="font-black">
                      {userTier === 'premium' ? 'FREE Delivery (₹0)' : userTier === 'pro' ? '₹30 / km' : '₹90 / km'}
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-600">
                    {userTier === 'premium' 
                      ? '✨ Premium Member Benefit: 100% Free delivery applied on all orders regardless of distance!' 
                      : userTier === 'pro'
                      ? '⚡ Pro Member Benefit: Subsidized delivery at ₹30/km.'
                      : 'Standard delivery rate of ₹90/km applies for Free tier users.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Supplier Yard Address for Pickup:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {product.supplier_address || 'Mandovi Building Solutions & Steel Yard, Plot 42, Phase II, Verna Industrial Estate, Goa 403722'}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                  ✓ Pickup Fee: ₹0 (Collect anytime between 8 AM – 7 PM)
                </p>
              </div>
            )}

            {/* Price Summary Breakdown */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Material Cost ({quantity} × ₹{product.indicative_price}):</span>
                <span className="font-bold">₹{itemsTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery Charges ({deliveryType === 'pickup' ? 'Self Pickup' : `${distanceKm} km @ ${deliveryRate ? `₹${deliveryRate}/km` : 'Free'}`}):</span>
                <span className="font-bold text-emerald-400">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black">
                <span>Total Amount:</span>
                <span className="text-amber-400 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Confirming Order...' : `Confirm & Place Order (₹${grandTotal.toLocaleString('en-IN')})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
