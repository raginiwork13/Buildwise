import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const Footer: React.FC = () => {
  const { setOpenRegisterModal, setSelectedRoleForModal } = useUser();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">
                Build<span className="text-amber-400">Wise</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowering construction in Goa through intelligent matching, deterministic cost estimation, side-by-side quotation auditing, and verified supplier networks.
            </p>
            <div className="text-[11px] text-amber-400 font-semibold">
              Hackathon Project: PS 6 – AI Construction Marketplace
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li><a href="#professionals" className="hover:text-amber-400 transition-colors">Civil Contractors in Goa</a></li>
              <li><a href="#professionals" className="hover:text-amber-400 transition-colors">Architects & Planners</a></li>
              <li><a href="#professionals" className="hover:text-amber-400 transition-colors">Structural Engineers</a></li>
              <li><a href="#materials" className="hover:text-amber-400 transition-colors">TMT Steel & Cement Suppliers</a></li>
              <li><Link to="/cost-estimator" className="hover:text-amber-400 transition-colors">Goa Cost Estimator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Active Goa Regions
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><strong>North Goa:</strong> Panaji, Porvorim, Mapusa, Calangute, Candolim, Assagao, Siolim</li>
              <li><strong>South Goa:</strong> Margao, Vasco da Gama, Verna, Colva, Benaulim, Ponda</li>
              <li className="pt-1 text-[11px] text-slate-500">Expanding across Western India</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Instant Access</h4>
            <p className="text-slate-400 mb-3 text-[11px]">
              No passwords or auth gates required. Pick your persona and start exploring features immediately.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedRoleForModal('customer');
                  setOpenRegisterModal(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs text-left cursor-pointer"
              >
                + Register as Property Owner
              </button>
              <button
                onClick={() => {
                  setSelectedRoleForModal('professional');
                  setOpenRegisterModal(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs text-left cursor-pointer"
              >
                + Register as Contractor (50 Free Credits)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 BuildWise. AI-Powered Construction Marketplace. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with React, Vite, Tailwind CSS, FastAPI & Supabase
          </div>
        </div>
      </div>
    </footer>
  );
};
