import React from 'react';
import { useUser } from '../context/UserContext';
import { FEATURED_MATERIALS } from '../data/mockData';
import { Truck, MapPin, CheckCircle, ShoppingCart } from 'lucide-react';

export const SupplierShowcase: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();

  return (
    <section id="materials" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              Direct Sourcing · Feature 9
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Goa Building Materials Marketplace
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Source cement, TMT steel, local laterite stone, sand, and tiles directly from certified suppliers across Bardez, Tiswadi, Salcete, and Mormugao.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedRoleForModal('supplier');
              setOpenRegisterModal(true);
            }}
            className="mt-4 md:mt-0 px-4 py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>List Products as Supplier</span>
          </button>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_MATERIALS.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={mat.image}
                    alt={mat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {mat.category}
                  </div>
                  {mat.inStock && (
                    <div className="absolute top-3 right-3 bg-white/95 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> In Stock
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{mat.name}</h3>
                  
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{mat.supplierName} ({mat.location})</span>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-900">{mat.unitPrice}</span>
                      <span className="text-[11px] text-slate-500 ml-1">/{mat.unit}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    setSelectedRoleForModal('customer');
                    setOpenRegisterModal(true);
                  }}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Request RFQ / Bulk Quote</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
