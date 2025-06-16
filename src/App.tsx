
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import GoogleMapProvider from "@/contexts/GoogleMapContext/GoogleMapProvider";
import { ServiceProviderProvider } from "@/contexts/ServiceProviders/ServiceProviderContext";
import { ModelGenerationProvider } from "@/contexts/ModelGeneration/ModelGenerationContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import RooftopDashboard from "./pages/RooftopDashboard";
import InternetDashboard from "./pages/InternetDashboard";
import EVChargingDashboard from "./pages/EVChargingDashboard";
import SubmitProperty from "./pages/SubmitProperty";
import AddAsset from "./pages/AddAsset";
import AccountPage from "./pages/AccountPage";
import AffiliateEarningsDashboard from "./pages/AffiliateEarningsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OnboardingChatbot from "./pages/OnboardingChatbot";
import EnhancedOnboardingChatbot from "./pages/EnhancedOnboardingChatbot";
import ModelViewer from "./pages/ModelViewer";
import Options from "./pages/Options";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <GoogleMapProvider>
                <ServiceProviderProvider>
                  <ModelGenerationProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/rooftop" element={<RooftopDashboard />} />
                      <Route path="/internet" element={<InternetDashboard />} />
                      <Route path="/ev-charging" element={<EVChargingDashboard />} />
                      <Route path="/submit-property" element={<SubmitProperty />} />
                      <Route path="/add-asset" element={<AddAsset />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/affiliate-earnings" element={<AffiliateEarningsDashboard />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/onboarding" element={<OnboardingChatbot />} />
                      <Route path="/onboarding-enhanced" element={<EnhancedOnboardingChatbot />} />
                      <Route path="/model-viewer" element={<ModelViewer />} />
                      <Route path="/options" element={<Options />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ModelGenerationProvider>
                </ServiceProviderProvider>
              </GoogleMapProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
