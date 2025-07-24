
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
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OnboardingChatbot from "./pages/OnboardingChatbot";
import EnhancedOnboardingChatbot from "./pages/EnhancedOnboardingChatbot";
import ModelViewer from "./pages/ModelViewer";
import GameifiedProperty from "./pages/GameifiedProperty";
import AddAsset from "./pages/AddAsset";
import Options from "./pages/Options";
import SubmitProperty from "./pages/SubmitProperty";
import AdminDashboard from "./pages/AdminDashboard";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import RooftopDashboard from "./pages/RooftopDashboard";
import ParkingDashboard from "./pages/ParkingDashboard";
import InternetDashboard from "./pages/InternetDashboard";
import EVChargingDashboard from "./pages/EVChargingDashboard";
import AffiliateEarningsDashboard from "./pages/AffiliateEarningsDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <ServiceProviderProvider>
            <GoogleMapProvider>
              <ModelGenerationProvider>
                <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/onboarding" element={<OnboardingChatbot />} />
                    <Route path="/dashboard/enhanced-onboarding" element={<EnhancedOnboardingChatbot />} />
                    <Route path="/model-viewer" element={<ModelViewer />} />
                    <Route path="/gamified-property" element={<GameifiedProperty />} />
                    <Route path="/add-asset" element={<AddAsset />} />
                    <Route path="/options" element={<Options />} />
                    <Route path="/submit-property" element={<SubmitProperty />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
                    <Route path="/dashboard/parking" element={<ParkingDashboard />} />
                    <Route path="/dashboard/internet" element={<InternetDashboard />} />
                    <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
                    <Route path="/dashboard/affiliate-earnings" element={<AffiliateEarningsDashboard />} />
                    <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
                <Sonner />
              </ModelGenerationProvider>
            </GoogleMapProvider>
          </ServiceProviderProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
