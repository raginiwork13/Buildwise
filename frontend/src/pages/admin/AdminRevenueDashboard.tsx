import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ArrowRight, ShieldCheck, 
  Sparkles, Calendar, User, HardHat, RefreshCw, AlertCircle,
  Crown, Zap
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface RevenueKPIs {
  total_platform_revenue: number;
  total_customer_commissions_2pct: number;
  total_pro_commissions_2pct: number;
  total_contract_value_managed: number;
  total_approved_engagements: number;
  commission_rate_customer: string;
  commission_rate_professional: string;
  total_platform_commission_take: string;
  // Subscription metrics
  total_subscription_revenue?: number;
  pro_profile_count?: number;
  pro_revenue?: number;
  premium_profile_count?: number;
  premium_revenue?: number;
}

interface RevenueTransaction {
  id: string;
  project_id: string;
  project_title: string;
  quotation_id?: string;
  agreed_budget: number;
  customer_name: string;
  customer_commission_rate: number;
  customer_commission_amount: number;
  professional_name: string;
  professional_commission_rate: number;
  professional_commission_amount: number;
  total_platform_revenue: number;
  status: string;
  payment_method: string;
  transaction_type: string;
  subscriber_email?: string;
  subscriber_name?: string;
  subscriber_role?: string;
  subscription_tier?: string;
  created_at: string;
}

export const AdminRevenueDashboard: React.FC = () => {
  const { role, switchRole } = useUser();
  const isAdmin = role === 'admin';

  const [kpis, setKpis] = useState<RevenueKPIs>({
    total_platform_revenue: 327897,
    total_customer_commissions_2pct: 163000,
    total_pro_commissions_2pct: 163000,
    total_contract_value_managed: 8150000,
    total_approved_engagements: 1,
    commission_rate_customer: '2.0%',
    commission_rate_professional: '2.0%',
    total_platform_commission_take: '4.0%',
    total_subscription_revenue: 1897,
    pro_profile_count: 1,
    pro_revenue: 299,
    premium_profile_count: 2,
    premium_revenue: 1598
  });

  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueTab, setRevenueTab] = useState<'all' | 'commission' | 'subscriptions'>('all');

  // Interactive Commission Calculator State
  const [calcBudget, setCalcBudget] = useState(2500000);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/revenue');
      if (res.ok) {
        const data = await res.json();
        if (data.kpis) setKpis(data.kpis);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch {
      // Fallback initial data
      setTransactions([
        {
          id: 'rev-demo-1',
          project_id: 'proj-c1',
          project_title: '4BHK Contemporary Portuguese Villa with Swimming Pool',
          quotation_id: 'quot-1',
          agreed_budget: 8150000,
          customer_name: 'Rahul Naik',
          customer_commission_rate: 2.0,
          customer_commission_amount: 163000,
          professional_name: 'Carlos Fernandes',
          professional_commission_rate: 2.0,
          professional_commission_amount: 163000,
          total_platform_revenue: 326000,
          status: 'collected',
          payment_method: 'Direct Platform Escrow',
          transaction_type: 'project_approval_commission',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Calculator outputs
  const calcCustomerFee = Math.round(calcBudget * 0.02);
  const calcProFee = Math.round(calcBudget * 0.02);
  const calcTotalTake = calcCustomerFee + calcProFee;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Admin Privileges Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The <strong>Platform Revenue & Business Model Hub</strong> is exclusively accessible to the single authorized BuildWise administrator account.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl text-left text-xs font-mono text-slate-600 border border-slate-200">
            <div><strong>Master Admin Email:</strong> admin@buildwise.goa</div>
            <div><strong>Password:</strong> admin123</div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => switchRole('admin')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Switch to BuildWise Master Admin Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Master Admin Exclusive
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-full">
                admin@buildwise.goa
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Platform Revenue & Monetization Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">
              Real-time monitoring of BuildWise's <strong>2% dual-approval commission model</strong>: 2% collected from Customers and 2% collected from Professionals on every agreed construction contract prior to execution.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={fetchRevenueData}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live Revenue</span>
              </button>
              
              <Link
                to="/admin/verifications"
                className="px-4 py-2 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 transition-all border border-indigo-400/30"
              >
                <span>View PWD Verification Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500/40 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Platform Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                ₹
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{kpis.total_platform_revenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Commissions + Subscriptions</span>
            </p>
          </div>

          {/* Premium Profiles & Revenue */}
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-indigo-900 text-xs font-bold uppercase tracking-wider">
              <span>Premium Profiles</span>
              <Crown className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-950">
              {kpis.premium_profile_count || 0} <span className="text-xs font-normal text-slate-500">Profiles</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-indigo-100">
              <span className="text-[11px] text-slate-500">Premium Revenue:</span>
              <span className="text-xs font-black text-indigo-700">₹{(kpis.premium_revenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Pro Profiles & Revenue */}
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-900 text-xs font-bold uppercase tracking-wider">
              <span>Pro Profiles</span>
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950">
              {kpis.pro_profile_count || 0} <span className="text-xs font-normal text-slate-500">Profiles</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-100">
              <span className="text-[11px] text-slate-500">Pro Revenue:</span>
              <span className="text-xs font-black text-emerald-700">₹{(kpis.pro_revenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Managed Contract Volume */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Agreed Contract Volume</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{kpis.total_contract_value_managed.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-indigo-700 font-semibold">
              Across {kpis.total_approved_engagements} Dual-Approved Project(s)
            </p>
          </div>

        </div>

        {/* Interactive 2% Commission Simulator */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-900/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/80 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Business Model Simulator
              </span>
              <h3 className="text-xl font-black mt-1">2% + 2% Commission Projection Calculator</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Platform Take</span>
              <span className="text-2xl font-black text-amber-400">₹{calcTotalTake.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Test Agreed Project Budget:</span>
              <span className="text-base font-black text-white">₹{calcBudget.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range"
              min="500000"
              max="50000000"
              step="250000"
              value={calcBudget}
              onChange={(e) => setCalcBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹5 Lakhs</span>
              <span>₹2.5 Crores</span>
              <span>₹5 Crores</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Pays (2%)</span>
              <span className="text-lg font-black text-blue-300">₹{calcCustomerFee.toLocaleString('en-IN')}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Platform escrow & warranty protection</p>
            </div>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Professional Pays (2%)</span>
              <span className="text-lg font-black text-amber-300">₹{calcProFee.toLocaleString('en-IN')}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Lead conversion & milestone disbursement</p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Net Platform Revenue (4%)</span>
              <span className="text-lg font-black text-emerald-400">₹{calcTotalTake.toLocaleString('en-IN')}</span>
              <p className="text-[10px] text-emerald-300/70 mt-0.5">Credited to platform master treasury</p>
            </div>
          </div>
        </div>

        {/* Revenue Transactions Table with Filtering */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Platform Revenue Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every transaction logged from 2% Dual-Approval Commissions and Premium/Pro Membership plans.
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
              <button
                onClick={() => setRevenueTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  revenueTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Events ({transactions.length})
              </button>
              <button
                onClick={() => setRevenueTab('commission')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  revenueTab === 'commission' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>2% Commissions</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                  {transactions.filter(t => !t.transaction_type.startsWith('subscription')).length}
                </span>
              </button>
              <button
                onClick={() => setRevenueTab('subscriptions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  revenueTab === 'subscriptions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Plans (Pro / Premium)</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                  {transactions.filter(t => t.transaction_type.startsWith('subscription')).length}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Loading platform revenue transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Revenue Transactions Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once a quotation proposal receives dual approval from both customer and professional, or users register with Pro/Premium plans, transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Event Type / Reference</th>
                    <th className="py-3 px-4">Profile & Account</th>
                    <th className="py-3 px-4 text-center">Category</th>
                    <th className="py-3 px-4 text-right">Value / Fee</th>
                    <th className="py-3 px-4 text-right">Revenue Added</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions
                    .filter(tx => {
                      const isSub = tx.transaction_type.startsWith('subscription');
                      if (revenueTab === 'commission') return !isSub;
                      if (revenueTab === 'subscriptions') return isSub;
                      return true;
                    })
                    .map((tx) => {
                      const isSubscription = tx.transaction_type.startsWith('subscription');
                      const tier = tx.subscription_tier || (tx.transaction_type.includes('premium') ? 'premium' : 'pro');

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              {isSubscription ? (
                                tier === 'premium' ? (
                                  <Crown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                )
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                              <span className="line-clamp-1">{tx.project_title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {tx.id} • {tx.payment_method}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {isSubscription ? (
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {tx.subscriber_name || tx.customer_name || tx.professional_name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {tx.subscriber_email || '-'} • {(tx.subscriber_role || 'member').toUpperCase()}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-1 text-slate-900 font-semibold">
                                  <User className="w-3 h-3 text-blue-500" />
                                  <span>{tx.customer_name} (2%)</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600 text-[11px] mt-0.5">
                                  <HardHat className="w-3 h-3 text-amber-500" />
                                  <span>{tx.professional_name} (2%)</span>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isSubscription ? (
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                tier === 'premium'
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {tier.toUpperCase()} PLAN
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                                4% Commission
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            {isSubscription ? (
                              <span>₹{tx.agreed_budget.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400">/mo</span></span>
                            ) : (
                              <div>
                                <div>₹{tx.agreed_budget.toLocaleString('en-IN')}</div>
                                <div className="text-[10px] text-slate-400 font-normal">Agreed Project Value</div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-black text-emerald-700">
                            ₹{tx.total_platform_revenue.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                              ✓ Collected
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                            <span className="flex items-center justify-end gap-1">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
