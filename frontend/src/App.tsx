import React from 'react';
import { UserProvider } from './context/UserContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RoleExplorer } from './components/RoleExplorer';
import { CostEstimatorPreview } from './components/CostEstimatorPreview';
import { FeaturedPros } from './components/FeaturedPros';
import { SupplierShowcase } from './components/SupplierShowcase';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Quick Project Search & Instant Estimate */}
        <HeroSection />

        {/* 2. Interactive Role Explorer (Property Owners vs Contractors vs Suppliers) */}
        <RoleExplorer />

        {/* 3. AI Cost Estimator Interactive Tool (Deterministic Goa Construction Model) */}
        <CostEstimatorPreview />

        {/* 4. Verified Professional Directory (Contractors, Architects, Engineers) */}
        <FeaturedPros />

        {/* 5. Building Materials Marketplace (Cement, TMT Steel, Laterite Stone, Tiles) */}
        <SupplierShowcase />

        {/* 6. How It Works (4-Step End-to-End Workflow) */}
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer />

      {/* Zero-Password Registration & Role-Switching Modal */}
      <RegistrationModal />
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
