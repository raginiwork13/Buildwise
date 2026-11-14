import React, { useState, useEffect } from 'react';
import { 
  X, Package, Truck, Clock, CheckCircle2, AlertCircle, 
  MapPin, Edit3 
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

export interface OrderItem {
  id: string;
  product_name: string;
  product_category: string;
  product_image?: string;
  supplier_name: string;
  supplier_address?: string;
  customer_name: string;
  customer_role: string;
  customer_tier: string;
  delivery_type: 'home_delivery' | 'pickup';
  delivery_address?: string;
  customer_latitude?: number;
  customer_longitude?: number;
  supplier_latitude?: number;
  supplier_longitude?: number;
  distance_km: number;
  delivery_fee: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  tracking_notes?: string;
  created_at: string;
}

interface ViewOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:          { label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed:        { label: 'Order Confirmed',      color: 'bg-blue-100 text-blue-800 border-blue-300',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  shipped:          { label: 'Dispatched / In Transit', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: <Truck className="w-3.5 h-3.5" /> },
  out_for_delivery: { label: 'Out for Delivery',     color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered:        { label: 'Delivered / Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled:        { label: 'Cancelled',            color: 'bg-red-100 text-red-800 border-red-300',       icon: <AlertCircle className="w-3.5 h-3.5" /> }
};

export const ViewOrdersModal: React.FC<ViewOrdersModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, role } = useUser();
  const isSupplier = role === 'supplier';
  const userName = currentUser?.fullName || '';

  const businessName = currentUser?.businessName || '';

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('shipped');
  const [trackingNotes, setTrackingNotes] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen, userName, businessName, role]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userName) params.append('user_name', userName);
      if (businessName) params.append('business_name', businessName);
      if (role) params.append('role', role);

      const res = await fetch(`http://localhost:8000/api/v1/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // Fallback demo order
      setOrders([
        {
          id: 'ord-demo-1',
          product_name: 'UltraTech Weather Plus Cement (50kg)',
          product_category: 'Cement',
          product_image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80',
          supplier_name: 'Mandovi Building Solutions & Steel Yard',
          supplier_address: 'Plot 42, Verna Industrial Estate, Goa',
          customer_name: 'Rahul Naik',
          customer_role: 'customer',
          customer_tier: 'pro',
          delivery_type: 'home_delivery',
          delivery_address: 'Villa #4, Borda, Margao, South Goa',
          distance_km: 12,
          delivery_fee: 360,
          quantity: 50,
          unit_price: 420,
          total_amount: 21360,
          status: 'shipped',
          tracking_notes: 'Dispatched via Tata 407 (GA-08-T-4521). Expected delivery today by 4 PM.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          tracking_notes: trackingNotes || undefined
        })
      });

      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: newStatus as any,
        tracking_notes: trackingNotes || o.tracking_notes
      } : o));

      setActionSuccess(`Order updated to "${newStatus.replace(/_/g, ' ').toUpperCase()}"!`);
      setEditingOrderId(null);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.warn('Update failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Order Fulfillment & Shipments
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isSupplier ? 'Manage Customer Orders & Shipments' : 'Track Your Material Orders'}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            {isSupplier 
              ? 'Review pending customer requests, dispatch delivery vehicles, and update shipment tracking status.'
              : 'Monitor real-time fulfillment, home delivery dispatches, and yard pickup readiness.'}
          </p>
        </div>

        {actionSuccess && (
          <div className="m-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isSupplier 
                  ? 'Customer and contractor orders for your products will appear here.'
                  : 'Browse supplier products on the marketplace to place an order.'}
              </p>
            </div>
          ) : (
            orders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const isBeingEdited = editingOrderId === order.id;

              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.product_image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80'}
                        alt={order.product_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{order.product_name}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Qty: <strong>{order.quantity} units</strong> • Total: <strong className="text-slate-900">₹{order.total_amount.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${cfg.color}`}>
                        {cfg.icon}
                        <span>{cfg.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Mode</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        {order.delivery_type === 'home_delivery' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            Home / Site Delivery ({order.distance_km} km)
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            Yard Self-Pickup
                          </>
                        )}
                      </span>
                      {order.delivery_type === 'home_delivery' && order.delivery_address && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          Address: {order.delivery_address}
                        </p>
                      )}
                      {order.customer_latitude && order.customer_longitude && (
                        <span className="inline-block mt-1 font-mono text-[10px] text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-semibold">
                          GPS: {order.customer_latitude}° N, {order.customer_longitude}° E
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {isSupplier ? 'Customer Details' : 'Supplier Details'}
                      </span>
                      <span className="font-bold text-slate-800 block mt-0.5">
                        {isSupplier ? order.customer_name : order.supplier_name}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Tier: <span className="uppercase font-semibold text-indigo-600">{order.customer_tier}</span> • Delivery Fee: {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
                      </span>
                    </div>
                  </div>

                  {/* Live Tracking Notes */}
                  {order.tracking_notes && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <strong>🚚 Shipping Update: </strong> {order.tracking_notes}
                    </div>
                  )}

                  {/* SUPPLIER ONLY: Status Update Form */}
                  {isSupplier && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      {!isBeingEdited ? (
                        <button
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setNewStatus(order.status);
                            setTrackingNotes(order.tracking_notes || '');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update Shipping Process</span>
                        </button>
                      ) : (
                        <div className="w-full p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3">
                          <div className="text-xs font-bold text-indigo-900">Update Shipment Status</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={newStatus}
                              onChange={e => setNewStatus(e.target.value)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-indigo-300 bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Dispatched / Shipped</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered / Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Vehicle #, Driver Contact, Delivery ETA..."
                              value={trackingNotes}
                              onChange={e => setTrackingNotes(e.target.value)}
                              className="px-3 py-1.5 text-xs rounded-xl border border-indigo-300 bg-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(order.id)}
                              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-700"
                            >
                              Save Tracking Update
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CUSTOMER ONLY: Read-only reassurance message */}
                  {!isSupplier && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Live tracking provided directly by {order.supplier_name}.</span>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
