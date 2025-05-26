
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceProviderProvider } from "@/contexts/ServiceProviders";
import Index from "./pages/Index";
import Options from "./pages/Options";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import RooftopDashboard from "./pages/RooftopDashboard";
import InternetDashboard from "./pages/InternetDashboard";
import EVChargingDashboard from "./pages/EVChargingDashboard";
import AddAsset from "./pages/AddAsset";
import AccountPage from "./pages/AccountPage";
import ModelViewer from "./pages/ModelViewer";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitProperty from "./pages/SubmitProperty";
import AffiliateEarningsDashboard from "./pages/AffiliateEarningsDashboard";
import { Suspense } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

// Loading component for suspense fallback
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
    <div className="text-white text-center">
      <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<LoadingScreen />}>
          <AuthProvider>
            <ServiceProviderProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/options" element={<Options />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
                <Route path="/dashboard/internet" element={<InternetDashboard />} />
                <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
                <Route path="/dashboard/add-asset" element={<AddAsset />} />
                <Route path="/dashboard/account" element={<AccountPage />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/affiliate" element={<AffiliateEarningsDashboard />} />
                <Route path="/model-viewer" element={<ModelViewer />} />
                <Route path="/submit-property" element={<SubmitProperty />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ServiceProviderProvider>
          </AuthProvider>
        </Suspense>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
