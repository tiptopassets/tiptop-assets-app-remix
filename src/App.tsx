
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
                <ModelGenerationProvider>
                  <ServiceProviderProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
                      <Route path="/dashboard/internet" element={<InternetDashboard />} />
                      <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
                      <Route path="/dashboard/add-asset" element={<AddAsset />} />
                      <Route path="/dashboard/affiliate" element={<AffiliateEarningsDashboard />} />
                      <Route path="/dashboard/account" element={<AccountPage />} />
                      <Route path="/dashboard/admin" element={<AdminDashboard />} />
                      <Route path="/dashboard/onboarding" element={<EnhancedOnboardingChatbot />} />
                      <Route path="/submit-property" element={<SubmitProperty />} />
                      <Route path="/onboarding" element={<OnboardingChatbot />} />
                      <Route path="/model-viewer" element={<ModelViewer />} />
                      <Route path="/options" element={<Options />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ServiceProviderProvider>
                </ModelGenerationProvider>
              </GoogleMapProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
