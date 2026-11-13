import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { UserProvider, useUser } from './context/UserContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RoleExplorer } from './components/RoleExplorer';
import { CostEstimatorPreview } from './components/CostEstimatorPreview';
import { FeaturedPros } from './components/FeaturedPros';
import { SupplierShowcase } from './components/SupplierShowcase';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';
import { NotificationsView } from './components/notifications/NotificationsView';
import { MessagingView } from './components/messaging/MessagingView';
import { NotificationSimulationBar } from './components/notifications/NotificationSimulationBar';
import { BuildwiseApiClient } from './api/buildwiseApi';
import type { FeaturedProfessional, MaterialCategoryItem } from './types';

export const AppContent: React.FC = () => {
  const { currentUser } = useUser();
  const [activeView, setActiveView] = useState<'home' | 'notifications' | 'messages'>('home');
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Direct Chat Handler from Professional Directory
  const handleStartChatWithPro = async (pro: FeaturedProfessional) => {
    if (!currentUser) {
      setActionError("Please select a user persona in the top navigation bar to start a conversation.");
      return;
    }
    setActionError(null);
    try {
      const conv = await BuildwiseApiClient.createConversation(
        currentUser.id,
        currentUser.fullName,
        currentUser.role,
        pro.id,
        pro.companyName || pro.name,
        'professional',
        `${pro.specialization} Project`,
        undefined,
        `Hello ${pro.name}, I am interested in discussing a construction project with ${pro.companyName}.`
      );
      if (conv && conv.id) {
        setActiveConversationId(conv.id);
        setActiveView('messages');
      } else {
        setActionError("Could not initialize conversation thread. Please check network connection.");
      }
    } catch (err: any) {
      console.error("Failed to start chat with professional:", err);
      setActionError(`Could not open chat with ${pro.name}: ${err?.message || 'Server error'}`);
      // Do NOT silently navigate to messages on error
    }
  };

  // Direct RFQ Handler from Materials Marketplace
  // Consolidates to a single flow: triggers RFQ event which creates or reuses the product-linked conversation and notifies supplier
  const handleRequestRFQWithSupplier = async (mat: MaterialCategoryItem) => {
    if (!currentUser) {
      setActionError("Please select a user persona in the top navigation bar to request a material RFQ.");
      return;
    }
    setActionError(null);
    try {
      const res = await BuildwiseApiClient.triggerSupplierRFQEvent({
        product_id: mat.id,
        product_name: mat.name,
        supplier_id: 'demo-supp-1',
        buyer_id: currentUser.id,
        buyer_name: currentUser.fullName,
        buyer_role: currentUser.role,
        quantity: 10,
        notes: `Bulk procurement inquiry for ${mat.name} (${mat.unitPrice}/${mat.unit}) to our site in Goa.`
      });
      if (res && res.conversation_id) {
        setActiveConversationId(res.conversation_id);
        setActiveView('messages');
      } else {
        setActionError("Could not dispatch RFQ to supplier. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to request RFQ with supplier:", err);
      setActionError(`Failed to submit RFQ for ${mat.name}: ${err?.message || 'Server error'}`);
      // Do NOT silently navigate to messages on error
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Global Navigation with Live Notification Bell & Unread Badges */}
      <Navbar
        activeView={activeView}
        onNavigateView={(view) => setActiveView(view)}
        onNavigateToContext={(url) => {
          if (url?.includes('/messages')) {
            setActiveView('messages');
          } else {
            setActiveView('home');
          }
        }}
      />

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between text-amber-950 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button 
            onClick={() => setActionError(null)}
            className="text-amber-800 hover:text-amber-950 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            {/* 1. Hero Section with Quick Project Search & Instant Estimate */}
            <HeroSection />

            {/* 2. Interactive Role Explorer (Property Owners vs Contractors vs Suppliers) */}
            <RoleExplorer />

            {/* 3. AI Cost Estimator Interactive Tool (Deterministic Goa Construction Model) */}
            <CostEstimatorPreview />

            {/* 4. Verified Professional Directory with Direct Chat Integration */}
            <FeaturedPros onStartChat={handleStartChatWithPro} />

            {/* 5. Building Materials Marketplace with Direct Supplier RFQ Integration */}
            <SupplierShowcase onRequestRFQ={handleRequestRFQWithSupplier} />

            {/* 6. How It Works (4-Step End-to-End Workflow) */}
            <HowItWorks />
          </>
        )}

        {activeView === 'notifications' && (
          <NotificationsView
            userId={currentUser ? currentUser.id : undefined}
            refreshTrigger={refreshKey}
            onBackToHome={() => setActiveView('home')}
            onNavigateToContext={(url) => {
              if (url?.includes('/messages')) {
                setActiveView('messages');
              } else {
                setActiveView('home');
              }
            }}
          />
        )}

        {activeView === 'messages' && (
          <MessagingView
            currentUser={currentUser}
            initialConversationId={activeConversationId}
            refreshTrigger={refreshKey}
            onBackToHome={() => setActiveView('home')}
          />
        )}
      </main>

      {/* Footer (Displayed on Home & Notifications views) */}
      {activeView !== 'messages' && <Footer />}

      {/* Zero-Password Registration & Role-Switching Modal */}
      <RegistrationModal />

      {/* Optional Live Marketplace Action Simulator (Demo Tool for Testing) */}
      <NotificationSimulationBar
        onEventDispatched={() => {
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
