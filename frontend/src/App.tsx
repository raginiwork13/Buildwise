import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProfessionalDiscovery } from './components/ProfessionalDiscovery';
import { RoleExplorer } from './components/RoleExplorer';
import { CostEstimatorPreview } from './components/CostEstimatorPreview';
import { FeaturedPros } from './components/FeaturedPros';
import { SupplierShowcase } from './components/SupplierShowcase';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';

import { CreateProfessionalProfile } from './pages/professional/CreateProfile';
import { PublicProfessionalProfile } from './pages/professional/PublicProfile';
import { PublicSupplierProfile } from './pages/supplier/PublicSupplierProfile';
import { VerificationManagement } from './pages/admin/VerificationManagement';

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ProfessionalDiscovery />
      <RoleExplorer />
      <CostEstimatorPreview />
      <FeaturedPros />
      <SupplierShowcase />
      <HowItWorks />
    </>
  );
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/professionals/new" element={<CreateProfessionalProfile />} />
          <Route path="/professionals/:id" element={<PublicProfessionalProfile />} />
          <Route path="/suppliers/:id" element={<PublicSupplierProfile />} />
          <Route path="/admin/verifications" element={<VerificationManagement />} />
        </Routes>
      </main>

      <Footer />
      <RegistrationModal />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}
