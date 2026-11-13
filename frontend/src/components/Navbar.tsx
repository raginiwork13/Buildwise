import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { 
  HardHat, 
  Home, 
  Truck, 
  ChevronDown, 
  Sparkles, 
  Building2, 
  UserPlus, 
  Coins, 
  MessageSquare
} from 'lucide-react';
import type { UserRole } from '../types';
import { NotificationBell } from './notifications/NotificationBell';
import { BuildwiseApiClient } from '../api/buildwiseApi';

interface NavbarProps {
  activeView?: 'home' | 'notifications' | 'messages';
  onNavigateView?: (view: 'home' | 'notifications' | 'messages') => void;
  onNavigateToContext?: (url?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView = 'home',
  onNavigateView,
  onNavigateToContext
}) => {
  const { currentUser, role, switchRole, setOpenRegisterModal, setSelectedRoleForModal } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState<number>(0);

  const fetchUnreadMessages = async () => {
    if (!currentUser?.id) return;
    try {
      const convs = await BuildwiseApiClient.getConversations(currentUser.id);
      const totalUnread = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadMsgCount(totalUnread);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const roleConfig = {
    customer: {
      label: 'Customer / Owner',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Home
    },
    professional: {
      label: 'Contractor / Pro',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
      icon: HardHat
    },
    supplier: {
      label: 'Material Supplier',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Truck
    }
  };

  const currentRoleInfo = roleConfig[role];
  const IconComponent = currentRoleInfo.icon;

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setDropdownOpen(false);
  };

  const handleNavClick = (view: 'home' | 'notifications' | 'messages', hash?: string) => {
    if (onNavigateView) {
      onNavigateView(view);
    }
    if (hash && view === 'home') {
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
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
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('home', '#professionals')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Find Professionals
            </button>
            <button
              onClick={() => handleNavClick('home', '#cost-estimator')}
              className="hover:text-amber-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Cost Estimator</span>
            </button>
            <button
              onClick={() => handleNavClick('home', '#materials')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Materials Marketplace
            </button>
            <button
              onClick={() => handleNavClick('home', '#how-it-works')}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>

            {/* Direct Communication Nav Links */}
            <div className="h-4 w-px bg-slate-200" />

            <button
              onClick={() => handleNavClick('messages')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'messages' ? 'text-amber-600 font-bold' : 'hover:text-amber-600'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Messages</span>
              {unreadMsgCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-xs">
                  {unreadMsgCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: Notifications, Active User Persona & Registration */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Feature 8 Notification Bell with Live Unread Counter */}
            {currentUser && (
              <NotificationBell
                userId={currentUser.id}
                onOpenNotificationsPage={() => {
                  if (onNavigateView) onNavigateView('notifications');
                }}
                onNavigateToContext={(url) => {
                  if (url?.includes('/messages')) {
                    if (onNavigateView) onNavigateView('messages');
                  } else if (onNavigateToContext) {
                    onNavigateToContext(url);
                  }
                }}
              />
            )}

            {/* Quick Messages Icon for Mobile */}
            <button
              onClick={() => handleNavClick('messages')}
              className="lg:hidden relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMsgCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {unreadMsgCount}
                </span>
              )}
            </button>

            {/* Active User Persona Pill & Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer ${currentRoleInfo.badgeClass}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span className="max-w-[100px] sm:max-w-none truncate">{currentUser ? currentUser.fullName : 'Guest'}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({currentRoleInfo.label})</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              </button>

              {/* Role Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Switch Active Persona (No Login Needed)
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('customer')}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${role === 'customer' ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-blue-600" />
                      <div>
                        <div>Rahul Naik (Customer)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Property Owner, Margao</div>
                      </div>
                    </div>
                    {role === 'customer' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('professional')}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${role === 'professional' ? 'font-bold text-amber-600 bg-amber-50/50' : 'text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <div>
                        <div>Carlos Fernandes (Contractor)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Civil Contractor, Panaji</div>
                      </div>
                    </div>
                    {role === 'professional' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('supplier')}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${role === 'supplier' ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <div>Sunil Silva (Supplier)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Mandovi Building Supplies</div>
                      </div>
                    </div>
                    {role === 'supplier' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>

                  {role === 'professional' && currentUser?.leadCredits !== undefined && (
                    <div className="mt-1 mx-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Coins className="w-3.5 h-3.5 text-amber-600" /> Lead Balance:
                      </span>
                      <span className="font-bold">{currentUser.leadCredits} Credits</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Register New User Button */}
            <button
              onClick={() => {
                setSelectedRoleForModal('customer');
                setOpenRegisterModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Register</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
