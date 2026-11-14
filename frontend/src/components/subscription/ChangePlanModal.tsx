import React, { useState } from 'react';
import { 
  X, Check, Crown, Zap, Shield, Sparkles, CheckCircle2, ArrowRight, Truck 
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, role, updateSubscriptionTier } = useUser();
  const currentTier = (currentUser?.subscriptionTier || 'free') as 'free' | 'pro' | 'premium';
  
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'premium'>(currentTier);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmPlan = async () => {
    setSubmitting(true);
    try {
      await updateSubscriptionTier(selectedTier);
      setSuccessMsg(`Your account is now upgraded to ${selectedTier.toUpperCase()} Plan!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1600);
    } catch {
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isCustomer = role === 'customer';
  const isSupplier = role === 'supplier';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Membership & Plans
          </span>
          <h2 className="text-2xl font-black">Choose Your BuildWise Plan</h2>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong>{currentUser?.fullName}</strong> ({role.toUpperCase()}) • Change your plan anytime with immediate access.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {successMsg ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Plan Updated Successfully!</h3>
              <p className="text-xs text-slate-600">{successMsg}</p>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-800 border border-emerald-200">
                ✓ All {selectedTier.toUpperCase()} benefits and pricing are now live on your account.
              </div>
            </div>
          ) : (
            <>
              {/* Plan Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. FREE PLAN */}
                <div
                  onClick={() => setSelectedTier('free')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTier === 'free'
                      ? 'border-slate-800 bg-slate-50/70 ring-2 ring-slate-800/10 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Free</span>
                      <Shield className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">₹0</div>
                    <div className="text-[10px] text-slate-400">Forever Free</div>

                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>Browse directory & supplier materials</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>Self pickup: <strong>₹0 fee</strong></span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Home delivery: <strong>₹90 / km</strong></span>
                      </div>
                    </div>
                  </div>

                  {currentTier === 'free' && (
                    <div className="mt-4 text-center">
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. PRO PLAN */}
                <div
                  onClick={() => setSelectedTier('pro')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    selectedTier === 'pro'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-md'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Popular
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Pro</span>
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ₹299<span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Billed monthly</div>

                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-700">
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isCustomer ? 'Discounted delivery: ₹30 / km' : 'SPONSORED badge & higher search ranking'}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isSupplier ? 'Featured material showcase' : 'Priority quote response from contractors'}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Yard self pickup: <strong>₹0 fee</strong></span>
                      </div>
                    </div>
                  </div>

                  {currentTier === 'pro' && (
                    <div className="mt-4 text-center">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. PREMIUM PLAN */}
                <div
                  onClick={() => setSelectedTier('premium')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    selectedTier === 'premium'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-md'
                      : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    VIP
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Premium</span>
                      <Crown className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ₹799<span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400">All-Inclusive VIP</div>

                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-[11px] text-indigo-950">
                      <div className="flex items-start gap-1.5 font-bold text-indigo-900">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{isCustomer ? '✨ 100% FREE Delivery on all orders!' : 'TOP SPONSORED #1 Marketplace placement'}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>Direct phone / chat messaging</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>Verified Gold Partner Badge</span>
                      </div>
                    </div>
                  </div>

                  {currentTier === 'premium' && (
                    <div className="mt-4 text-center">
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Delivery Benefit Highlight */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Material Delivery Rate for {selectedTier.toUpperCase()} Member:</span>
                  </span>
                  <span className="font-black text-sm text-amber-400">
                    {selectedTier === 'premium' ? 'FREE Delivery (₹0)' : selectedTier === 'pro' ? '₹30 / km' : '₹90 / km'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedTier === 'premium'
                    ? 'With Premium, delivery fees are 100% waived across North & South Goa at all times.'
                    : selectedTier === 'pro'
                    ? 'Pro members save ₹60 per km compared to the standard rate.'
                    : 'Free plan members pay standard delivery charges of ₹90 per km.'}
                </p>
              </div>

              {/* Action CTA */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmPlan}
                  className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    'Updating Plan in Supabase...'
                  ) : (
                    <>
                      <span>Confirm {selectedTier.toUpperCase()} Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
