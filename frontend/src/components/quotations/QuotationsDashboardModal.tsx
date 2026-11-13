import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, XCircle, Play, MessageSquare, 
  Truck, HardHat, ShieldCheck, X, Check 
} from 'lucide-react';

export interface QuotationItem {
  id: string;
  project_id: string;
  project_title: string;
  customer_id?: string;
  customer_name: string;
  provider_id: string;
  provider_name: string;
  provider_role: string;
  provider_company?: string;
  total_estimated_price: number;
  material_costs: number;
  labour_costs: number;
  transport_charges: number;
  service_charges: number;
  expected_completion_time: string;
  payment_milestones?: string;
  materials_included?: string;
  materials_excluded?: string;
  terms_and_conditions?: string;
  quotation_validity_days?: number;
  status: 'submitted' | 'approved' | 'rejected' | 'work_started';
  created_at?: string;
}

interface QuotationsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithProvider: (providerName: string, providerRole: string, projectTitle: string) => void;
}

export const QuotationsDashboardModal: React.FC<QuotationsDashboardModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenChatWithProvider 
}) => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchQuotations();
    }
  }, [isOpen]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/quotations');
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch {
      // Fallback quotations
      setQuotations([
        {
          id: 'quot-1',
          project_id: 'proj-c1',
          project_title: '4BHK Contemporary Portuguese Villa with Swimming Pool',
          customer_name: 'Rahul Naik',
          provider_id: 'prof-carlos-1',
          provider_name: 'Carlos Fernandes',
          provider_role: 'professional',
          provider_company: 'Fernandes & Sons Civil Construction',
          total_estimated_price: 8150000.0,
          material_costs: 4900000.0,
          labour_costs: 2400000.0,
          transport_charges: 250000.0,
          service_charges: 600000.0,
          expected_completion_time: '11 Months',
          payment_milestones: '15% Advance, 25% Plinth completion, 30% RCC Slab casting, 20% Masonry & Plastering, 10% Final handover',
          materials_included: 'UltraTech PPC Cement, Tata Tiscon 550D TMT Steel, Local Laterite Stone blocks, Dr. Fixit Damp-proof coating',
          materials_excluded: 'Sanitary fixtures, Italian marble/vitrified tiles (client supplied)',
          terms_and_conditions: 'PWD Class-1 execution standards with 5-year structural warranty.',
          quotation_validity_days: 30,
          status: 'submitted'
        },
        {
          id: 'quot-2',
          project_id: 'proj-c1',
          project_title: '4BHK Contemporary Portuguese Villa with Swimming Pool',
          customer_name: 'Rahul Naik',
          provider_id: 'prof-ananya-2',
          provider_name: 'Ar. Ananya Deshmukh',
          provider_role: 'professional',
          provider_company: 'Atelier Goa Architecture',
          total_estimated_price: 680000.0,
          material_costs: 0.0,
          labour_costs: 480000.0,
          transport_charges: 20000.0,
          service_charges: 180000.0,
          expected_completion_time: '3 Months for Blueprints & CRZ Clearances',
          payment_milestones: '30% Concept Masterplan, 40% Municipal Drawings, 30% Site Supervision Milestone checks',
          materials_included: 'Architectural, Structural & MEP CAD/BIM blueprints with 3D walkthroughs',
          materials_excluded: 'Municipal council scrutiny fees (paid directly to govt)',
          terms_and_conditions: 'Includes 12 scheduled site inspection visits during crucial casting phases.',
          quotation_validity_days: 45,
          status: 'submitted'
        },
        {
          id: 'quot-3',
          project_id: 'proj-c1',
          project_title: '4BHK Contemporary Portuguese Villa with Swimming Pool',
          customer_name: 'Rahul Naik',
          provider_id: 'supp-mandovi-1',
          provider_name: 'Sunil Silva',
          provider_role: 'supplier',
          provider_company: 'Mandovi Building Solutions & Steel Yard',
          total_estimated_price: 1450000.0,
          material_costs: 1380000.0,
          labour_costs: 0.0,
          transport_charges: 70000.0,
          service_charges: 0.0,
          expected_completion_time: 'Immediate staged deliveries across 8 months',
          payment_milestones: '30% Advance, 70% staggered upon delivery per truckload',
          materials_included: '1,200 Bags UltraTech Weather Plus Cement, 18 Metric Tons Tata Tiscon 550D Rebar, 8,000 Laterite stones',
          materials_excluded: 'Unloading crane fees if site access is restricted',
          terms_and_conditions: 'Price locked against market price fluctuations for 60 days.',
          quotation_validity_days: 60,
          status: 'submitted'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'work_started', providerName: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/quotations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Status updated locally:', err);
    }

    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    
    if (newStatus === 'approved') {
      setActionSuccess(`Quotation from ${providerName} approved! You can now start project work.`);
    } else if (newStatus === 'work_started') {
      setActionSuccess(`Project successfully commenced with ${providerName}! Milestone tracking active.`);
    } else {
      setActionSuccess(`Quotation from ${providerName} rejected.`);
    }

    setTimeout(() => setActionSuccess(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Customer Quotations Center
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Quotations Received from Contractors & Suppliers</h2>
          <p className="text-slate-300 text-xs mt-1">Review competitive bids, inspect cost breakdowns, approve quotations, and commence work.</p>
        </div>

        {actionSuccess && (
          <div className="m-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Quotations Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Contractors and suppliers will submit detailed pricing here once they review your project.</p>
            </div>
          ) : (
            quotations.map((quot) => {
              const formattedTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(quot.total_estimated_price);

              return (
                <div
                  key={quot.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                    quot.status === 'approved' 
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                      : quot.status === 'work_started'
                      ? 'border-indigo-400 ring-2 ring-indigo-500/15'
                      : quot.status === 'rejected'
                      ? 'border-red-200 opacity-60'
                      : 'border-slate-200'
                  }`}
                >
                  
                  {/* Top Bar: Provider info & Status */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-800 border border-slate-200">
                        {quot.provider_role === 'supplier' ? <Truck className="w-5 h-5 text-emerald-600" /> : <HardHat className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                          {quot.provider_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {quot.provider_company || 'Independent Civil Specialist'} • <span className="uppercase text-[10px] font-bold text-indigo-600">{quot.provider_role}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {quot.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {quot.status === 'work_started' && (
                        <span className="bg-indigo-100 text-indigo-900 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-300">
                          <Play className="w-3.5 h-3.5" /> Work Commenced
                        </span>
                      )}
                      {quot.status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Declined
                        </span>
                      )}
                      {quot.status === 'submitted' && (
                        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Target */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <strong className="text-slate-800">For Project:</strong> {quot.project_title}
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-indigo-700 font-bold uppercase">Total Quotation</div>
                      <div className="text-base font-black text-indigo-950 mt-0.5">{formattedTotal}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <div className="text-[10px] text-slate-400">Material Costs</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">₹{quot.material_costs.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <div className="text-[10px] text-slate-400">Labour Costs</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">₹{quot.labour_costs.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <div className="text-[10px] text-slate-400">Transport & Fleet</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">₹{quot.transport_charges.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <div className="text-[10px] text-slate-400">Estimated Timeline</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{quot.expected_completion_time}</div>
                    </div>
                  </div>

                  {/* Milestones & Inclusions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {quot.payment_milestones && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                        <span className="font-bold text-slate-800 block text-[11px]">Payment Milestones</span>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{quot.payment_milestones}</p>
                      </div>
                    )}
                    {quot.materials_included && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                        <span className="font-bold text-slate-800 block text-[11px]">Materials Included</span>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{quot.materials_included}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <button
                      onClick={() => onOpenChatWithProvider(quot.provider_name, quot.provider_role, quot.project_title)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Chat with {quot.provider_name}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {quot.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(quot.id, 'rejected', quot.provider_name)}
                            className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(quot.id, 'approved', quot.provider_name)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Quotation</span>
                          </button>
                        </>
                      )}

                      {quot.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(quot.id, 'work_started', quot.provider_name)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs animate-bounce"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Select & Start Working on Project</span>
                        </button>
                      )}

                      {quot.status === 'work_started' && (
                        <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Contract Active • Execution Underway</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

