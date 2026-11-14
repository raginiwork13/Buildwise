import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Building2, Sparkles, ChevronDown, User, Bell, Edit3, 
  ExternalLink, HardHat, Home, Truck, ShieldCheck, Check, Plus, FolderKanban, MessageSquare, LogIn, Scale,
  Crown, Zap, Shield, Package, X, Award
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { UserProfile } from '../types';
import { ChangePlanModal } from './subscription/ChangePlanModal';

interface NotificationItem {
  id: string | number;
  title: string;
  desc: string;
  time?: string;
  unread: boolean;
  type?: string;
  recipient_role?: string;
  created_at?: string;
}

const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (isNaN(diff) || diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const Navbar: React.FC = () => {
  const location = useLocation();
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'init-1', title: 'Welcome to BuildWise', desc: 'Real-time order tracking and supplier notifications are active.', time: 'Just now', unread: true, type: 'system' }
  ]);
  const [toast, setToast] = useState<{ id: string; title: string; desc: string; type?: string } | null>(null);

  const fetchNotifications = async () => {
    try {
      const activeRole = role || 'customer';
      const res = await fetch(`http://localhost:8000/api/v1/notifications?role=${activeRole}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data.map((n: any) => ({
            ...n,
            time: formatTimeAgo(n.created_at)
          })));
        }
      }
    } catch {
      // Backend fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);

    const handleOrderPlaced = (e: any) => {
      const detail = e.detail;
      fetchNotifications();
      // If current view is supplier, show immediate notification toast banner
      if (role === 'supplier' && detail) {
        setToast({
          id: `toast-${Date.now()}`,
          title: detail.title || '📦 Received Order',
          desc: detail.desc || 'A consumer has placed a new building material order.',
          type: 'order'
        });
      }
    };

    const handleProjectCompleted = (e: any) => {
      const detail = e.detail;
      fetchNotifications();
      if (detail) {
        setToast({
          id: `toast-${Date.now()}`,
          title: detail.title || '🏆 Project Completed!',
          desc: detail.desc || 'Both consumer and professional have confirmed project completion.',
          type: 'project'
        });
      }
    };

    window.addEventListener('supplier_order_placed', handleOrderPlaced);
    window.addEventListener('project_completed', handleProjectCompleted);
    window.addEventListener('refresh_notifications', fetchNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('supplier_order_placed', handleOrderPlaced);
      window.removeEventListener('project_completed', handleProjectCompleted);
      window.removeEventListener('refresh_notifications', fetchNotifications);
    };
  }, [role, currentUser]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    try {
      await fetch(`http://localhost:8000/api/v1/notifications/mark-all-read?role=${role || ''}`, {
        method: 'PUT'
      });
    } catch {
      // Offline fallback
    }
  };

  const roleConfig = {
    customer: { label: 'Property Owner', badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: Home },
    professional: { label: 'Contractor / Pro', badge: 'bg-amber-100 text-amber-900 border-amber-200', icon: HardHat },
    supplier: { label: 'Material Supplier', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Truck },
    admin: { label: 'Platform Admin', badge: 'bg-purple-100 text-purple-900 border-purple-300', icon: ShieldCheck }
  };

  const handleUserSelect = (account: UserProfile) => {
    switchUser(account);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center leading-none">
                  Build<span className="text-amber-500">Wise</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 ml-1.5">Goa</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold mt-0.5">AI Construction</span>
              </div>
            </Link>
          </div>

          {/* Clean, Even, Organized Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
            {[
              { path: '/professionals', label: 'Professionals', icon: HardHat },
              { path: '/suppliers', label: 'Suppliers', icon: Truck },
              { path: '/projects', label: 'Projects', icon: FolderKanban },
              { path: '/cost-estimator', label: 'AI Estimator', icon: Sparkles },
              { path: '/quotations/compare', label: 'Compare Quotes', icon: Scale },
            ].map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {role === 'admin' && (
              <Link 
                to="/admin/revenue" 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-1 ${
                  location.pathname === '/admin/revenue'
                    ? 'bg-purple-900 text-purple-100 shadow-2xs'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Revenue (2%)</span>
              </Link>
            )}
          </nav>

          {/* Right Action Group: Utilities, Plan Pill & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Quick Chat Icon */}
            <Link
              to="/projects"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="Chat Messenger (Direct Inquiries)"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
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
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-3 rounded-xl text-xs transition-colors ${n.unread ? 'bg-amber-50/70 border border-amber-200 shadow-2xs' : 'bg-slate-50'}`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                            <span className="flex items-center gap-1.5">
                              {n.type === 'order' && <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              {n.type === 'project' && <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{n.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compact, Organized Plan Badge Button */}
            <button
              onClick={() => setChangePlanOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                userTier === 'premium'
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                  : userTier === 'pro'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Click to view or change your subscription plan"
            >
              {userTier === 'premium' && <Crown className="w-3.5 h-3.5 text-indigo-600" />}
              {userTier === 'pro' && <Zap className="w-3.5 h-3.5 text-emerald-600" />}
              {userTier === 'free' && <Shield className="w-3.5 h-3.5 text-slate-500" />}
              <span className="uppercase text-[11px] font-black">{userTier}</span>
              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200/60">
                {userTier === 'free' ? 'Upgrade' : 'Plan'}
              </span>
            </button>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs shadow-2xs">
                  {currentUser?.fullName.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[100px]">{currentUser ? currentUser.fullName : 'Profile'}</span>
                    <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                  </div>
                  <div className="text-[9px] text-slate-400 leading-none mt-0.5 capitalize">
                    {roleConfig[role].label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
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

                    {/* Admin Revenue Dashboard */}
                    {role === 'admin' && (
                      <Link
                        to="/admin/revenue"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between bg-purple-50 text-purple-950 font-bold border border-purple-200 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Platform Revenue & Commission (2%)</span>
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-black">Admin</span>
                      </Link>
                    )}
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
                        const Icon = acct.role === 'admin' ? ShieldCheck : acct.role === 'professional' ? HardHat : acct.role === 'supplier' ? Truck : Home;
                        const roleColor = 
                          acct.role === 'admin' ? 'text-purple-600' :
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

      {/* Floating Real-Time Notification Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border animate-in slide-in-from-top-4 flex items-start gap-3 backdrop-blur-md ${
          toast.type === 'project' ? 'border-amber-500/50 shadow-amber-500/10' : 'border-emerald-500/50 shadow-emerald-500/10'
        }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            toast.type === 'project' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {toast.type === 'project' ? (
              <Award className="w-5 h-5 text-amber-400 animate-bounce" />
            ) : (
              <Package className="w-5 h-5 text-emerald-400 animate-bounce" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`font-black text-xs tracking-wide uppercase ${
                toast.type === 'project' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {toast.type === 'project' ? 'Milestone Milestone' : 'New Notification'}
              </span>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <h4 className="font-bold text-sm text-white mt-0.5">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.desc}</p>
          </div>
          <button 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Change / Upgrade Plan Modal */}
      <ChangePlanModal
        isOpen={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
      />
    </header>
  );
};
