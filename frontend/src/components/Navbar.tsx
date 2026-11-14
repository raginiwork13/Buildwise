import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Building2, Sparkles, ChevronDown, User, Bell, Edit3, 
  ExternalLink, HardHat, Home, Truck, ShieldCheck, Check, Plus, FolderKanban, MessageSquare, LogIn, Scale,
  Crown, Zap, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../types';
import { ChangePlanModal } from './subscription/ChangePlanModal';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    role, 
    accounts, 
    switchUser, 
    setOpenRegisterModal, 
    setSelectedRoleForModal, 
    setOpenLoginModal 
  } = useUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);

  const userTier = (currentUser?.subscriptionTier || 'free') as 'free' | 'pro' | 'premium';

  // Mock notifications for demonstration
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Villa Lead in Porvorim', desc: 'Customer Rahul posted a 3,200 sq.ft residential project matching your area.', time: '10m ago', unread: true },
    { id: 2, title: 'License Verification Approved', desc: 'Your PWD Class-1 certificate was verified by admin.', time: '1h ago', unread: true },
    { id: 3, title: 'Supplier Price Update', desc: 'Mandovi Building Solutions updated UltraTech cement bag pricing.', time: '1d ago', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const roleConfig = {
    customer: { label: 'Property Owner', badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: Home },
    professional: { label: 'Contractor / Pro', badge: 'bg-amber-100 text-amber-900 border-amber-200', icon: HardHat },
    supplier: { label: 'Material Supplier', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Truck }
  };

  const handleUserSelect = (account: UserProfile) => {
    switchUser(account);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Build<span className="text-amber-500">Wise</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 ml-1">Goa</span>
                </span>
                <span className="block text-[10px] text-slate-500 tracking-wider uppercase font-medium">AI Construction Marketplace</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium text-slate-600">
            <Link 
              to="/professionals" 
              className="text-slate-900 font-bold hover:text-amber-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Professional Marketplace</span>
            </Link>
            <Link 
              to="/suppliers" 
              className="text-slate-900 font-bold hover:text-emerald-700 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supplier Marketplace</span>
            </Link>
            <Link 
              to="/projects" 
              className="text-slate-900 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
              <span>Projects</span>
            </Link>
            <Link to="/cost-estimator" className="hover:text-amber-600 transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Cost Estimator</span>
            </Link>
            <Link 
              to="/quotations/compare" 
              className="text-slate-900 font-bold hover:text-purple-700 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 text-xs"
            >
              <Scale className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Quotation Comparison</span>
            </Link>
          </nav>

          {/* Right Action: Notifications & Profile Box */}
          <div className="flex items-center gap-3">
            
            {/* Quick Chat Link */}
            <Link
              to="/projects"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Chat Messenger (OLX / WhatsApp style)"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full" />
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[11px] font-semibold text-amber-600 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl text-xs transition-colors ${n.unread ? 'bg-amber-50/70 border border-amber-100' : 'bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Plan / Upgrade Button */}
            <button
              onClick={() => setChangePlanOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs border ${
                userTier === 'premium'
                  ? 'bg-gradient-to-r from-indigo-900 to-indigo-950 text-white border-indigo-500/30 hover:border-indigo-400'
                  : userTier === 'pro'
                  ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-white border-emerald-500/30 hover:border-emerald-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
              }`}
              title="Click to view or change your subscription plan"
            >
              {userTier === 'premium' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
              {userTier === 'pro' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
              {userTier === 'free' && <Shield className="w-3.5 h-3.5 text-amber-600" />}
              <span className="uppercase">{userTier} Plan</span>
              <span className="text-[10px] text-amber-400 font-bold ml-0.5">
                {userTier === 'free' ? '• Upgrade' : '• Change'}
              </span>
            </button>

            {/* THE "PROFILE" BOX BUTTON */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.fullName.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                    <span>{currentUser ? currentUser.fullName : 'My Profile'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none mt-0.5 capitalize">
                    {roleConfig[role].label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Comprehensive Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  
                  {/* Current Active Persona Summary */}
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig[role].badge}`}>
                        Active Profile: {roleConfig[role].label}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{currentUser?.fullName}</div>
                    <div className="text-[11px] text-slate-500">{currentUser?.email}</div>

                    {/* Subscription Tier Banner in Dropdown */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {userTier === 'premium' && <Crown className="w-3.5 h-3.5 text-indigo-600" />}
                        {userTier === 'pro' && <Zap className="w-3.5 h-3.5 text-emerald-600" />}
                        {userTier === 'free' && <Shield className="w-3.5 h-3.5 text-slate-500" />}
                        <div>
                          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-800">
                            {userTier} Plan
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {userTier === 'premium' ? 'Free Delivery • VIP' : userTier === 'pro' ? '₹30/km Delivery • Pro' : '₹90/km Delivery'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setChangePlanOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Change Plan
                      </button>
                    </div>
                  </div>

                  {/* Profile Management Actions */}
                  <div className="py-3 border-b border-slate-100 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                      Profile Management
                    </div>

                    {/* View Public Profile */}
                    {role === 'professional' ? (
                      <Link
                        to="/professionals/prof-carlos-1"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-500" />
                          <span>View Public Profile & Portfolio</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    ) : role === 'supplier' ? (
                      <Link
                        to="/suppliers/supp-mandovi-1"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-500" />
                          <span>View Supplier Catalogue</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    ) : (
                      <div className="px-2.5 py-1.5 text-[11px] text-slate-500">
                        Customer Account: {currentUser?.defaultLocation || 'Goa'}
                      </div>
                    )}

                    {/* Edit / Build Professional Profile */}
                    <Link
                      to="/professionals/new"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-500" />
                        <span>Edit / Build Profile Wizard</span>
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">5 Steps</span>
                    </Link>

                    {/* Admin Verification Queue */}
                    <Link
                      to="/admin/verifications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Verification Submissions & Badges</span>
                      </span>
                    </Link>
                  </div>

                  {/* Switch Persona (Customer vs Professional vs Supplier) */}
                  <div className="pt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                      <span>Switch Active User Mode</span>
                      <span className="text-[9px] text-emerald-600 font-normal">Dynamic Accounts</span>
                    </div>

                    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                      {accounts.map((acct) => {
                        const isCurrent = currentUser?.email.toLowerCase() === acct.email.toLowerCase();
                        const Icon = acct.role === 'professional' ? HardHat : acct.role === 'supplier' ? Truck : Home;
                        const roleColor = 
                          acct.role === 'professional' ? 'text-amber-500' :
                          acct.role === 'supplier' ? 'text-emerald-500' :
                          'text-blue-500';

                        return (
                          <button
                            key={acct.email}
                            onClick={() => handleUserSelect(acct)}
                            className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between cursor-pointer transition-colors ${
                              isCurrent 
                                ? 'bg-amber-50/80 text-slate-900 font-bold border border-amber-200' 
                                : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Icon className={`w-3.5 h-3.5 ${roleColor} shrink-0`} />
                              <div className="truncate text-left">
                                <div className="text-xs truncate leading-tight">
                                  {acct.fullName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal truncate capitalize">
                                  {acct.role} • {acct.email}
                                </div>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setOpenLoginModal(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <LogIn className="w-3 h-3 text-indigo-600" /> Log In
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRoleForModal('customer');
                          setOpenRegisterModal(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Register Profile
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Change / Upgrade Plan Modal */}
      <ChangePlanModal
        isOpen={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
      />
    </header>
  );
};
