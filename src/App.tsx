
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import GoogleMapProvider from "./contexts/GoogleMapContext/GoogleMapProvider";
import { ModelGenerationProvider } from "./contexts/ModelGeneration/ModelGenerationContext";
import { ServiceProviderProvider } from "./contexts/ServiceProviders/ServiceProviderContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import OnboardingChatbot from "./pages/OnboardingChatbot";
import EnhancedOnboardingChatbot from "./pages/EnhancedOnboardingChatbot";
import AddAsset from "./pages/AddAsset";
import ModelViewer from "./pages/ModelViewer";
import EVChargingDashboard from "./pages/EVChargingDashboard";
import RooftopDashboard from "./pages/RooftopDashboard";
import InternetDashboard from "./pages/InternetDashboard";
import AffiliateEarningsDashboard from "./pages/AffiliateEarningsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitProperty from "./pages/SubmitProperty";
import AccountPage from "./pages/AccountPage";
import Options from "./pages/Options";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                    <Route path="/onboarding" element={<OnboardingChatbot />} />
                    <Route path="/enhanced-onboarding" element={<EnhancedOnboardingChatbot />} />
                    <Route path="/add-asset" element={<AddAsset />} />
                    <Route path="/model-viewer" element={<ModelViewer />} />
                    <Route path="/ev-charging" element={<EVChargingDashboard />} />
                    <Route path="/rooftop" element={<RooftopDashboard />} />
                    <Route path="/internet" element={<InternetDashboard />} />
                    <Route path="/affiliate-earnings" element={<AffiliateEarningsDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/submit-property" element={<SubmitProperty />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/options" element={<Options />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ServiceProviderProvider>
              </ModelGenerationProvider>
            </GoogleMapProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
