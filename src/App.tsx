
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

const App = () => (
  <ErrorBoundary>
    <GoogleMapProvider>
      <ModelGenerationProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <TooltipProvider>
              <AuthProvider>
                <ErrorBoundary fallback={
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-purple-900">
                    <div className="text-white text-center">
                      <h2 className="text-xl font-bold mb-2">Service Provider Error</h2>
                      <p className="text-gray-300">Please refresh the page to continue.</p>
                    </div>
                  </div>
                }>
                  <ServiceProviderProvider>
                    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900">
                      <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Loading...</p>
                          </div>
                        </div>
                      }>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/model-viewer" element={<ModelViewer />} />
                          <Route path="/add-asset" element={<AddAsset />} />
                          <Route path="/submit-property" element={<SubmitProperty />} />
                          <Route path="/options" element={<Options />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/affiliate-earnings" element={<AffiliateEarningsDashboard />} />
                          <Route path="/account" element={<AccountPage />} />
                          <Route path="/rooftop" element={<RooftopDashboard />} />
                          <Route path="/internet" element={<InternetDashboard />} />
                          <Route path="/ev-charging" element={<EVChargingDashboard />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                      <Toaster />
                      <Sonner />
                    </div>
                  </ServiceProviderProvider>
                </ErrorBoundary>
              </AuthProvider>
            </TooltipProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ModelGenerationProvider>
    </GoogleMapProvider>
  </ErrorBoundary>
);

export default App;
