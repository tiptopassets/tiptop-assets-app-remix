
import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleMapProvider } from '@/contexts/GoogleMapContext';
import { ModelGenerationProvider } from '@/contexts/ModelGeneration';
import { ServiceProviderProvider } from '@/contexts/ServiceProviders';
import ErrorBoundary from '@/components/ErrorBoundary';
import DataSyncNotification from '@/components/DataSyncNotification';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import RooftopDashboard from '@/pages/RooftopDashboard';
import InternetDashboard from '@/pages/InternetDashboard';
import EVChargingDashboard from '@/pages/EVChargingDashboard';
import AffiliateEarningsDashboard from '@/pages/AffiliateEarningsDashboard';
import AddAsset from '@/pages/AddAsset';
import Options from '@/pages/Options';
import OnboardingChatbot from '@/pages/OnboardingChatbot';
import AdminDashboard from '@/pages/AdminDashboard';
import AccountPage from '@/pages/AccountPage';
import SubmitProperty from '@/pages/SubmitProperty';
import ModelViewer from '@/pages/ModelViewer';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    console.log('🗺️ Google Maps loaded:', mapLoaded);
  }, [mapLoaded]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ServiceProviderProvider>
              <GoogleMapProvider>
                <ModelGenerationProvider>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
                      <Route path="/dashboard/internet" element={<InternetDashboard />} />
                      <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
                      <Route path="/dashboard/affiliate" element={<AffiliateEarningsDashboard />} />
                      <Route path="/dashboard/add-asset" element={<AddAsset />} />
                      <Route path="/dashboard/admin" element={<AdminDashboard />} />
                      <Route path="/dashboard/account" element={<AccountPage />} />
                      <Route path="/options" element={<Options />} />
                      <Route path="/onboarding" element={<OnboardingChatbot />} />
                      <Route path="/submit-property" element={<SubmitProperty />} />
                      <Route path="/model-viewer" element={<ModelViewer />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <DataSyncNotification />
                    <Toaster />
                  </div>
                </ModelGenerationProvider>
              </GoogleMapProvider>
            </ServiceProviderProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
