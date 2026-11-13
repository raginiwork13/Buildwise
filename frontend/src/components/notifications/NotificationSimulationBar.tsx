import React, { useState } from 'react';
import { Sparkles, ChevronUp, ChevronDown, HardHat, FileText, CheckCircle2, Truck, Activity } from 'lucide-react';
import { BuildwiseApiClient } from '../../api/buildwiseApi';

interface NotificationSimulationBarProps {
  onEventDispatched?: () => void;
}

export const NotificationSimulationBar: React.FC<NotificationSimulationBarProps> = ({
  onEventDispatched
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActiveMessage(msg);
    setTimeout(() => setActiveMessage(null), 4000);
    if (onEventDispatched) onEventDispatched();
  };

  const handleSimulateEnquiry = async () => {
    setLoadingAction('enquiry');
    try {
      await BuildwiseApiClient.triggerEnquiryEvent({
        project_id: 'proj-margao-1',
        project_title: '2,400 sq.ft Luxury Villa Margao',
        customer_id: 'demo-cust-1',
        professional_id: 'demo-prof-1',
        professional_name: 'Carlos Fernandes',
        pitch_message: 'We have 14 years of PWD Class 1 experience in Margao RCC foundations.',
        action: 'submit'
      });
      showFeedback('✓ Carlos submitted enquiry! Check Customer Rahul Naik notifications & messages.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateShortlist = async () => {
    setLoadingAction('shortlist');
    try {
      await BuildwiseApiClient.triggerEnquiryEvent({
        project_id: 'proj-margao-1',
        project_title: '2,400 sq.ft Luxury Villa Margao',
        customer_id: 'demo-cust-1',
        professional_id: 'demo-prof-1',
        professional_name: 'Carlos Fernandes',
        action: 'shortlist'
      });
      showFeedback('✓ Rahul shortlisted Carlos! Switch to Contractor Carlos to see shortlist notification.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateQuotation = async () => {
    setLoadingAction('quotation');
    try {
      await BuildwiseApiClient.triggerQuotationEvent({
        quotation_id: `quote-${Date.now()}`,
        project_id: 'proj-margao-1',
        project_title: '2,400 sq.ft Luxury Villa Margao',
        customer_id: 'demo-cust-1',
        professional_id: 'demo-prof-1',
        professional_name: 'Carlos Fernandes',
        total_price: 4850000,
        action: 'submit'
      });
      showFeedback('✓ Itemized quotation (₹48.5L) posted to chat & Customer notified!');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateSupplierRFQ = async () => {
    setLoadingAction('rfq');
    try {
      await BuildwiseApiClient.triggerSupplierRFQEvent({
        product_id: 'mat-2',
        product_name: 'Tata Tiscon 550D TMT Steel Rebars',
        supplier_id: 'demo-supp-1',
        buyer_id: 'demo-prof-1',
        buyer_name: 'Carlos Fernandes',
        buyer_role: 'professional',
        quantity: 15,
        notes: 'Need 15 Metric Tons delivery to Margao villa site by Thursday.'
      });
      showFeedback('✓ Bulk RFQ sent to Supplier Sunil Silva! Switch to Supplier persona to view.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <aside aria-label="Demo Testing Bar" className="fixed bottom-3 right-3 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-amber-400 border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>🧪 Live Action Simulator (Demo Tool)</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl p-4 w-80 sm:w-96 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Real Marketplace Actions</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Trigger genuine backend events to verify live cross-persona notification delivery and conversation creation.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSimulateEnquiry}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex flex-col justify-between transition-colors cursor-pointer"
            >
              <HardHat className="w-4 h-4 text-amber-400 mb-1" />
              <div className="font-bold text-white text-[11px]">1. Submit Proposal</div>
              <div className="text-[9px] text-slate-400">Carlos → Rahul</div>
            </button>

            <button
              onClick={handleSimulateShortlist}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex flex-col justify-between transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400 mb-1" />
              <div className="font-bold text-white text-[11px]">2. Shortlist Pro</div>
              <div className="text-[9px] text-slate-400">Rahul → Carlos</div>
            </button>

            <button
              onClick={handleSimulateQuotation}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex flex-col justify-between transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="font-bold text-white text-[11px]">3. Submit Quote</div>
              <div className="text-[9px] text-slate-400">₹48.5L Itemized</div>
            </button>

            <button
              onClick={handleSimulateSupplierRFQ}
              disabled={loadingAction !== null}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex flex-col justify-between transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-teal-400 mb-1" />
              <div className="font-bold text-white text-[11px]">4. Bulk Steel RFQ</div>
              <div className="text-[9px] text-slate-400">Carlos → Sunil</div>
            </button>
          </div>

          {activeMessage && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold animate-in fade-in">
              {activeMessage}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

