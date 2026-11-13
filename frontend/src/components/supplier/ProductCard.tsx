import React, { useState } from 'react';
import type { SupplierProductItem } from '../../types/profile';
import { CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

interface Props {
  product: SupplierProductItem;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const [rfqSent, setRfqSent] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          <img
            src={product.primary_image_url || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80'}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {product.category}
          </div>
          <div className="absolute top-3 right-3">
            {product.in_stock ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <XCircle className="w-3 h-3 text-slate-400" /> Backorder
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {product.brand && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              {product.brand}
            </div>
          )}
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product.product_name}</h4>
          <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>

          {product.specifications && (
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Specs:</span>
              <span className="line-clamp-1">{product.specifications}</span>
            </div>
          )}

          <div className="pt-2 flex items-baseline justify-between">
            <div>
              <span className="text-lg font-black text-slate-900">
                ₹{product.indicative_price.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 ml-1">/{product.unit_of_measurement}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => setRfqSent(true)}
          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            rfqSent
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {rfqSent ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RFQ Inquiry Sent ✓</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Request Price Quote / RFQ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
