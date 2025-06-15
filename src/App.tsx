
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleMapProvider } from "@/contexts/GoogleMapContext";
import { ModelGenerationProvider } from "@/contexts/ModelGeneration";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceProviderProvider } from "@/contexts/ServiceProviders";
import ErrorBoundary from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ModelViewer from "./pages/ModelViewer";
import AddAsset from "./pages/AddAsset";
import SubmitProperty from "./pages/SubmitProperty";
import Options from "./pages/Options";
import AdminDashboard from "./pages/AdminDashboard";
import AffiliateEarningsDashboard from "./pages/AffiliateEarningsDashboard";
import AccountPage from "./pages/AccountPage";
import RooftopDashboard from "./pages/RooftopDashboard";
import InternetDashboard from "./pages/InternetDashboard";
import EVChargingDashboard from "./pages/EVChargingDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Routes that don't need ServiceProviderProvider
const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/options" element={<Options />} />
    <Route path="/submit-property" element={<SubmitProperty />} />
    <Route path="*" element={<ProtectedRoutes />} />
  </Routes>
);

// Routes that need ServiceProviderProvider
const ProtectedRoutes = () => (
  <ErrorBoundary fallback={
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900">
      <div className="text-white text-center">
        <h2 className="text-xl font-bold mb-2">Service Provider Error</h2>
        <p className="text-gray-300 mb-4">Please refresh the page to continue.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-tiptop-purple hover:bg-tiptop-purple/90 px-4 py-2 rounded text-white"
        >
          Refresh Page
        </button>
      </div>
    </div>
  }>
    <ServiceProviderProvider>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
        <Route path="/dashboard/internet" element={<InternetDashboard />} />
        <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
        <Route path="/dashboard/affiliate" element={<AffiliateEarningsDashboard />} />
        <Route path="/dashboard/add-asset" element={<AddAsset />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/account" element={<AccountPage />} />
        <Route path="/model-viewer" element={<ModelViewer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ServiceProviderProvider>
  </ErrorBoundary>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <GoogleMapProvider>
              <ModelGenerationProvider>
                <div className="min-h-screen bg-gradient-to-b from-black to-purple-900">
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Loading...</p>
                      </div>
                    </div>
                  }>
                    <PublicRoutes />
                  </Suspense>
                  <Toaster />
                  <Sonner />
                </div>
              </ModelGenerationProvider>
            </GoogleMapProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
