
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleMapProvider } from '@/contexts/GoogleMapContext';
import { ModelGenerationProvider } from '@/contexts/ModelGeneration';
import { ServiceProviderProvider } from '@/contexts/ServiceProviders';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OnboardingChatbot = lazy(() => import('./pages/OnboardingChatbot'));
const EnhancedOnboardingChatbot = lazy(() => import('./pages/EnhancedOnboardingChatbot'));
const ModelViewer = lazy(() => import('./pages/ModelViewer'));
const SubmitProperty = lazy(() => import('./pages/SubmitProperty'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AddAsset = lazy(() => import('./pages/AddAsset'));
const Options = lazy(() => import('./pages/Options'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RooftopDashboard = lazy(() => import('./pages/RooftopDashboard'));
const InternetDashboard = lazy(() => import('./pages/InternetDashboard'));
const EVChargingDashboard = lazy(() => import('./pages/EVChargingDashboard'));
const AffiliateEarningsDashboard = lazy(() => import('./pages/AffiliateEarningsDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <GoogleMapProvider>
                <ServiceProviderProvider>
                  <ModelGenerationProvider>
                    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
                      <Suspense 
                        fallback={
                          <div className="min-h-screen flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <p>Loading...</p>
                            </div>
                          </div>
                        }
                      >
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/onboarding" element={<OnboardingChatbot />} />
                          <Route path="/enhanced-onboarding" element={<EnhancedOnboardingChatbot />} />
                          <Route path="/model-viewer" element={<ModelViewer />} />
                          <Route path="/submit-property" element={<SubmitProperty />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/account" element={<AccountPage />} />
                          <Route path="/add-asset" element={<AddAsset />} />
                          <Route path="/options" element={<Options />} />
                          <Route path="/rooftop-dashboard" element={<RooftopDashboard />} />
                          <Route path="/internet-dashboard" element={<InternetDashboard />} />
                          <Route path="/ev-charging-dashboard" element={<EVChargingDashboard />} />
                          <Route path="/affiliate-earnings" element={<AffiliateEarningsDashboard />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                      <Toaster />
                    </div>
                  </ModelGenerationProvider>
                </ServiceProviderProvider>
              </GoogleMapProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
