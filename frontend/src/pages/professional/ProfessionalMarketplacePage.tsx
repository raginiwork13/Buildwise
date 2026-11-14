import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { ProfessionalDiscovery } from '../../components/ProfessionalDiscovery';
import { useUser } from '../../context/UserContext';
import { OlxChatDrawer } from '../../components/chat/OlxChatDrawer';
import type { ChatTarget } from '../../components/chat/OlxChatDrawer';
import { ChangePlanModal } from '../../components/subscription/ChangePlanModal';

export const ProfessionalMarketplacePage: React.FC = () => {
  const { currentUser } = useUser();
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleEnquireChat = (target: ChatTarget) => {
    const userTier = (currentUser?.subscriptionTier || 'free').toLowerCase();
    const canChat = userTier === 'pro' || userTier === 'premium';

    if (!canChat) {
      setShowUpgradeModal(true);
      return;
    }

    setChatTarget(target);
    setShowChatDrawer(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Marketplace Page Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 py-10 px-4 sm:px-6 lg:px-8 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Goa Construction Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Professional Marketplace
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Browse, filter, and compare all verified civil contractors, principal architects, structural consultants, and interior designers across Goa.
            </p>
          </div>

          {/* Action to list professional profile */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/professionals/new"
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-amber-300/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Professional Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Full Directory Listing (Displays all profiles without home page limit) */}
      <ProfessionalDiscovery 
        isHomePageView={false} 
        onEnquireViaChat={handleEnquireChat}
      />

      {/* Floating Messenger trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            const userTier = (currentUser?.subscriptionTier || 'free').toLowerCase();
            if (userTier === 'pro' || userTier === 'premium') {
              setShowChatDrawer(true);
            } else {
              setShowUpgradeModal(true);
            }
          }}
          className="p-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative cursor-pointer group"
          title="Open Messenger (Chat with Customers & Professionals)"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-slate-950 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            💬
          </span>
          <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
            Live Chat Messenger
          </span>
        </button>
      </div>

      {/* OLX/Real-time Chat Drawer */}
      {showChatDrawer && (
        <OlxChatDrawer
          isOpen={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          initialTarget={chatTarget}
        />
      )}

      {/* Upgrade Plan Modal */}
      <ChangePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

