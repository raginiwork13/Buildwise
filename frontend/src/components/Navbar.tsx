import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { HardHat, Home, Truck, ChevronDown, Sparkles, Building2, UserPlus, Coins } from 'lucide-react';
import type { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { currentUser, role, switchRole, setOpenRegisterModal, setSelectedRoleForModal } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
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
            </a>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#professionals" className="hover:text-amber-600 transition-colors">Find Professionals</a>
            <a href="#cost-estimator" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Cost Estimator</span>
            </a>
            <a href="#materials" className="hover:text-amber-600 transition-colors">Materials Marketplace</a>
            <a href="#how-it-works" className="hover:text-amber-600 transition-colors">How It Works</a>
          </nav>

          {/* Right Action: Active User Persona & Registration */}
          <div className="flex items-center gap-3">
            
            {/* Active User Persona Pill & Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer ${currentRoleInfo.badgeClass}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{currentUser ? currentUser.fullName : 'Guest'}</span>
                <span className="text-[10px] opacity-75">({currentRoleInfo.label})</span>
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
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Register Profile</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
