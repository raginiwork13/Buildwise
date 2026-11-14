import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  LogIn, 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { 
    openLoginModal, 
    setOpenLoginModal, 
    loginUser, 
    switchUser,
    accounts, 
    currentUser,
    setOpenRegisterModal,
    setSelectedRoleForModal 
  } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!openLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ok = await loginUser(email, password);
      if (!ok) {
        setError('Login failed. Please verify your credentials or register a new profile.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccountSelect = (acct: any) => {
    switchUser(acct);
    setOpenLoginModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white relative">
          <button
            onClick={() => setOpenLoginModal(false)}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
              BW
            </span>
            <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
              Goa Construction Cloud
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <LogIn className="w-5 h-5 text-amber-400" />
            <span>Sign In to BuildWise</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access your saved projects, quotes, client inquiries, or supplier catalogue.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com or pat@supplies.in"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">
                  (Optional in Demo Mode)
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Switch Registered Accounts Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Or 1-Click Select Saved Account
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Supabase Synced
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {accounts.map((acct) => {
                const isActive = currentUser?.email.toLowerCase() === acct.email.toLowerCase();
                const roleBadge = 
                  acct.role === 'admin' ? 'bg-purple-100 text-purple-900 font-bold border border-purple-200' :
                  acct.role === 'professional' ? 'bg-amber-100 text-amber-800' :
                  acct.role === 'supplier' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-blue-800';

                return (
                  <button
                    key={acct.email}
                    type="button"
                    onClick={() => handleQuickAccountSelect(acct)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300' 
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {acct.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="truncate text-left">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          <span>{acct.fullName}</span>
                          {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {acct.email}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${roleBadge}`}>
                      {acct.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Profile Registration Prompt */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">
              Don't have a profile yet? Register in 30 seconds:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleForModal('customer');
                  setOpenLoginModal(false);
                  setOpenRegisterModal(true);
                }}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[10px] rounded-lg transition-colors border border-blue-200"
              >
                + Customer
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleForModal('professional');
                  setOpenLoginModal(false);
                  setOpenRegisterModal(true);
                }}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] rounded-lg transition-colors border border-amber-200"
              >
                + Professional
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleForModal('supplier');
                  setOpenLoginModal(false);
                  setOpenRegisterModal(true);
                }}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg transition-colors border border-emerald-200"
              >
                + Supplier
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
