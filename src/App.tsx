
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleMapProvider } from './contexts/GoogleMapContext';
import { ServiceProviderProvider } from './contexts/ServiceProviders';
import { Toaster } from './components/ui/toaster';

// Page imports
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ModelViewer from './pages/ModelViewer';
import OnboardingChatbot from './pages/OnboardingChatbot';
import EnhancedOnboardingChatbot from './pages/EnhancedOnboardingChatbot';
import AddAsset from './pages/AddAsset';
import RooftopDashboard from './pages/RooftopDashboard';
import EVChargingDashboard from './pages/EVChargingDashboard';
import InternetDashboard from './pages/InternetDashboard';
import ParkingDashboard from './pages/ParkingDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AffiliateEarningsDashboard from './pages/AffiliateEarningsDashboard';
import SubmitProperty from './pages/SubmitProperty';
import Options from './pages/Options';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';
import ManageAssets from './pages/ManageAssets';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleMapProvider>
          <ServiceProviderProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/manage" element={<ManageAssets />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/add-asset" element={<AddAsset />} />
                <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
                <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
                <Route path="/dashboard/internet" element={<InternetDashboard />} />
                <Route path="/dashboard/parking" element={<ParkingDashboard />} />
                <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
                <Route path="/dashboard/affiliate" element={<AffiliateEarningsDashboard />} />
                <Route path="/dashboard/onboarding" element={<EnhancedOnboardingChatbot />} />
                <Route path="/dashboard/settings" element={<SettingsPage />} />
                <Route path="/dashboard/account" element={<AccountPage />} />
                <Route path="/model-viewer" element={<ModelViewer />} />
                <Route path="/chatbot" element={<OnboardingChatbot />} />
                <Route path="/submit-property" element={<SubmitProperty />} />
                <Route path="/options" element={<Options />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </ServiceProviderProvider>
        </GoogleMapProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
