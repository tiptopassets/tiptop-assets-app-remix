
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
  <GoogleMapProvider>
    <ModelGenerationProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <AuthProvider>
              <ServiceProviderProvider>
                <div className="min-h-screen bg-gradient-to-b from-black to-purple-900">
                  <Suspense fallback={<div>Loading...</div>}>
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
            </AuthProvider>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ModelGenerationProvider>
  </GoogleMapProvider>
);

export default App;
