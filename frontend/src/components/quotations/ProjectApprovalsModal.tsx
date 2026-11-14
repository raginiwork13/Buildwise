import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, User,
  Calendar, ShieldCheck, X, Check, AlertCircle, Clock
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import type { QuotationItem } from './QuotationsDashboardModal';

interface ProjectApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyProjects?: (workspaceId?: string) => void;
  onApprovalsCountChange?: (count: number) => void;
}

export const ProjectApprovalsModal: React.FC<ProjectApprovalsModalProps> = ({
  isOpen,
  onClose,
  onOpenMyProjects,
  onApprovalsCountChange
}) => {
  const { currentUser } = useUser();
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);

  const professionalName = currentUser?.fullName || 'Carlos Fernandes';

  useEffect(() => {
    if (isOpen || currentUser) {
      fetchCustomerApprovedQuotations();
    }
  }, [isOpen, currentUser]);

  const fetchCustomerApprovedQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/quotations');
      if (res.ok) {
        const data: QuotationItem[] = await res.json();
        // Filter quotations submitted by this professional that have been approved by customer OR work_started
        const filtered = data.filter(q => 
          (q.provider_name.toLowerCase() === professionalName.toLowerCase() ||
           q.provider_id === currentUser?.id)
        );
        setQuotations(filtered);
        const pendingCount = filtered.filter(q => q.status === 'approved').length;
        if (onApprovalsCountChange) onApprovalsCountChange(pendingCount);
      }
    } catch {
      // Demo fallback if backend is offline
      const demoList: QuotationItem[] = [
        {
          id: 'quot-1',
          project_id: 'proj-c1',
          project_title: 'Coastal RCC Structural Retrofitting & Saline Waterproofing',
          customer_name: 'Sunita Borkar',
          provider_id: 'prof-carlos-1',
          provider_name: 'Carlos Fernandes',
          provider_role: 'professional',
          provider_company: 'Fernandes & Sons Civil Construction',
          total_estimated_price: 1800000.0,
          expected_completion_time: '10 Months',
          document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          document_filename: 'Carlos_Structural_Retrofit_Quotation_BOQ.pdf',
          notes: 'Customer approved your submitted quotation and is requesting you to accept project commencement.',
          status: 'approved'
        }
      ];
      setQuotations(demoList);
      if (onApprovalsCountChange) onApprovalsCountChange(1);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalDecision = async (quot: QuotationItem, decision: 'accept' | 'decline') => {
    const newStatus = decision === 'accept' ? 'work_started' : 'rejected';

    setQuotations(prev => prev.map(q => q.id === quot.id ? { ...q, status: newStatus as any } : q));

    try {
      await fetch(`http://localhost:8000/api/v1/quotations/${quot.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (decision === 'accept') {
        // Activate/Create the project workspace since both have approved!
        const wsRes = await fetch('http://localhost:8000/api/v1/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `ws-${quot.project_id}`,
            project_id: quot.project_id,
            project_title: quot.project_title,
            customer_name: quot.customer_name,
            professional_name: quot.provider_name,
            professional_company: quot.provider_company || '',
            agreed_amount: quot.total_estimated_price,
            expected_start_date: new Date().toISOString().slice(0, 10),
            expected_completion_date: '',
          })
        });

        if (wsRes.ok) {
          const wsData = await wsRes.json();
          setCreatedWorkspaceId(wsData.id);
        } else {
          setCreatedWorkspaceId(`ws-${quot.project_id}`);
        }

        // Record 2% Platform Commission Revenue (Business Model)
        try {
          await fetch('http://localhost:8000/api/v1/admin/revenue/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: quot.project_id,
              project_title: quot.project_title,
              quotation_id: quot.id,
              agreed_budget: quot.total_estimated_price,
              customer_name: quot.customer_name,
              professional_name: quot.provider_name,
              customer_commission_rate: 2.0,
              professional_commission_rate: 2.0,
              payment_method: 'Direct Platform Escrow',
              transaction_type: 'project_approval_commission'
            })
          });
        } catch (revErr) {
          console.warn('Revenue commission record notice:', revErr);
        }
      }
    } catch (err) {
      console.warn('Decision updated locally:', err);
      if (decision === 'accept') {
        setCreatedWorkspaceId(`ws-${quot.project_id}`);
      }
    }

    if (decision === 'accept') {
      setActionSuccess(`🎉 Project Engagement Accepted! Both sides have approved. The project workspace is now active.`);
    } else {
      setActionSuccess(`Project engagement declined.`);
    }

    // Refresh count
    fetchCustomerApprovedQuotations();
    setTimeout(() => setActionSuccess(null), 4500);
  };

  const pendingApprovals = quotations.filter(q => q.status === 'approved');
  const pastApprovals = quotations.filter(q => q.status === 'work_started' || q.status === 'rejected');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Professional Action Center
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Project Approvals</h2>
          <p className="text-slate-300 text-xs mt-1">
            Customers have reviewed and approved your quotations. Review engagement details and approve to activate the live project workspace.
          </p>
        </div>

        {actionSuccess && (
          <div className="m-4 p-3.5 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            {onOpenMyProjects && (
              <button 
                onClick={() => { onClose(); onOpenMyProjects(createdWorkspaceId || undefined); }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
              >
                Go to Project Progress →
              </button>
            )}
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading project approvals...</div>
          ) : pendingApprovals.length === 0 && pastApprovals.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Project Approvals Pending</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When a customer accepts your quotation proposal, it will appear here for your confirmation to commence work.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* SECTION 1: PENDING APPROVAL FROM PROFESSIONAL */}
              {pendingApprovals.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Awaiting Your Final Confirmation ({pendingApprovals.length})</span>
                  </div>

                  {pendingApprovals.map(quot => {
                    const formattedTotal = new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(quot.total_estimated_price);

                    return (
                      <div 
                        key={quot.id}
                        className="bg-white rounded-2xl border-2 border-amber-300/80 p-5 shadow-sm space-y-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                          Customer Approved
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            Work Agreement Proposal
                          </span>
                          <h3 className="text-base font-black text-slate-900 mt-1.5 leading-snug">
                            {quot.project_title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-slate-700 font-semibold">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              Customer: {quot.customer_name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Timeline: {quot.expected_completion_time || 'Agreed Timeline'}
                            </span>
                          </div>
                        </div>

                        {/* Price & Details Banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Agreed Budget</span>
                            <span className="text-base font-black text-slate-900">{formattedTotal}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Quotation Ref</span>
                            <span className="font-bold text-indigo-600 truncate block">{quot.document_filename || 'Quotation_BOQ.pdf'}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Status</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved Bid
                            </span>
                          </div>
                        </div>

                        {quot.notes && (
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-700">
                            <strong className="text-indigo-950">Scope / Notes: </strong>
                            {quot.notes}
                          </div>
                        )}

                        {/* Platform Business Model 2% Commission Notice */}
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Platform Revenue & Escrow Commission (2% + 2% Model)</span>
                            </span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                              Platform Revenue
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-medium border-t border-emerald-200/60">
                            <div>
                              <span className="text-emerald-700 block text-[10px]">Customer (2%):</span>
                              <strong className="text-slate-900">₹{(quot.total_estimated_price * 0.02).toLocaleString('en-IN')}</strong>
                            </div>
                            <div>
                              <span className="text-emerald-700 block text-[10px]">Professional (2%):</span>
                              <strong className="text-slate-900">₹{(quot.total_estimated_price * 0.02).toLocaleString('en-IN')}</strong>
                            </div>
                            <div>
                              <span className="text-emerald-700 block text-[10px]">Total Revenue:</span>
                              <strong className="text-emerald-800">₹{(quot.total_estimated_price * 0.04).toLocaleString('en-IN')}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Dual-approval info notice */}
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            By clicking <strong>Approve & Commence Project</strong>, both parties will have officially confirmed the engagement, and the project will enter <strong>My Projects Progress</strong> with live milestone and payment tracking.
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleProfessionalDecision(quot, 'decline')}
                            className="px-4 py-2 border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Decline Engagement
                          </button>
                          
                          <button
                            onClick={() => handleProfessionalDecision(quot, 'accept')}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-lg"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve & Commence Project</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION 2: PAST / COMMENCED APPROVALS */}
              {pastApprovals.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Confirmed Engagements
                  </h4>
                  {pastApprovals.map(quot => (
                    <div 
                      key={quot.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{quot.project_title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Customer: {quot.customer_name} • Agreed Amount: ₹{quot.total_estimated_price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      
                      {quot.status === 'work_started' ? (
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active in Progress
                          </span>
                          {onOpenMyProjects && (
                            <button
                              onClick={() => { onClose(); onOpenMyProjects(`ws-${quot.project_id}`); }}
                              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              View Workspace →
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Declined
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
