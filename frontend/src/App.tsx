import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProfessionalDiscovery } from './components/ProfessionalDiscovery';
import { RoleExplorer } from './components/RoleExplorer';
import { FeaturedPros } from './components/FeaturedPros';
import { SupplierShowcase } from './components/SupplierShowcase';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { RegistrationModal } from './components/RegistrationModal';

import { CreateProfessionalProfile } from './pages/professional/CreateProfile';
import { PublicProfessionalProfile } from './pages/professional/PublicProfile';
import { ProfessionalMarketplacePage } from './pages/professional/ProfessionalMarketplacePage';
import { CreateSupplierProfile } from './pages/supplier/CreateSupplierProfile';
import { SupplierMarketplacePage } from './pages/supplier/SupplierMarketplacePage';
import { PublicSupplierProfile } from './pages/supplier/PublicSupplierProfile';
import { VerificationManagement } from './pages/admin/VerificationManagement';
import { CostEstimatorPage } from './pages/CostEstimatorPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ProfessionalDiscovery isHomePageView={true} />
      <RoleExplorer />
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
          <Route path="/cost-estimator" element={<CostEstimatorPage />} />
          <Route path="/professionals" element={<ProfessionalMarketplacePage />} />
          <Route path="/professionals/new" element={<CreateProfessionalProfile />} />
          <Route path="/professionals/:id" element={<PublicProfessionalProfile />} />
          <Route path="/suppliers" element={<SupplierMarketplacePage />} />
          <Route path="/suppliers/new" element={<CreateSupplierProfile />} />
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
      <ScrollToTop />
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}
