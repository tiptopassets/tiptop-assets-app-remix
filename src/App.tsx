
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapProvider } from "@/contexts/GoogleMapContext";
import { ModelGenerationProvider } from "@/contexts/ModelGeneration";
import { ServiceProviderProvider } from "@/contexts/ServiceProviders";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AddAsset from "./pages/AddAsset";
import ModelViewer from "./pages/ModelViewer";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import OnboardingChatbot from "./pages/OnboardingChatbot";
import EnhancedOnboardingChatbot from "./pages/EnhancedOnboardingChatbot";
import SubmitProperty from "./pages/SubmitProperty";
import Options from "./pages/Options";
import AccountPage from "./pages/AccountPage";
import RooftopDashboard from "./pages/RooftopDashboard";
import InternetDashboard from "./pages/InternetDashboard";
import EVChargingDashboard from "./pages/EVChargingDashboard";
import AffiliateEarningsDashboard from "./pages/AffiliateEarningsDashboard";
import GoogleMapsDiagnosticPage from "./pages/GoogleMapsDiagnosticPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <ServiceProviderProvider>
                <GoogleMapProvider>
                  <ModelGenerationProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/add-asset" element={<AddAsset />} />
                      <Route path="/model-viewer" element={<ModelViewer />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/onboarding" element={<OnboardingChatbot />} />
                      <Route path="/enhanced-onboarding" element={<EnhancedOnboardingChatbot />} />
                      <Route path="/submit-property" element={<SubmitProperty />} />
                      <Route path="/options" element={<Options />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/rooftop-dashboard" element={<RooftopDashboard />} />
                      <Route path="/internet-dashboard" element={<InternetDashboard />} />
                      <Route path="/ev-charging-dashboard" element={<EVChargingDashboard />} />
                      <Route path="/affiliate-earnings" element={<AffiliateEarningsDashboard />} />
                      <Route path="/diagnostics/google-maps" element={<GoogleMapsDiagnosticPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ModelGenerationProvider>
                </GoogleMapProvider>
              </ServiceProviderProvider>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
