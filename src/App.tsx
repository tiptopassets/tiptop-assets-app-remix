
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceProviderProvider } from "@/contexts/ServiceProviders";
import { GoogleMapProvider } from "@/contexts/GoogleMapContext";
import { ModelGenerationProvider } from "@/contexts/ModelGeneration";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ServiceProviderProvider>
          <GoogleMapProvider>
            <ModelGenerationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/options" element={<Options />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/rooftop" element={
                    <ProtectedRoute>
                      <RooftopDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/internet" element={
                    <ProtectedRoute>
                      <InternetDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/ev-charging" element={
                    <ProtectedRoute>
                      <EVChargingDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/add-asset" element={
                    <ProtectedRoute>
                      <AddAsset />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/account" element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/affiliate" element={
                    <ProtectedRoute>
                      <AffiliateEarningsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/model-viewer" element={<ModelViewer />} />
                  <Route path="/submit-property" element={<SubmitProperty />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </ModelGenerationProvider>
          </GoogleMapProvider>
        </ServiceProviderProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
