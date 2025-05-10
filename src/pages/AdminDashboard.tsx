
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from 'react-router-dom';
import LoginStatsSummary from '@/components/admin/LoginStatsSummary';
import LoginStatsTable from '@/components/admin/LoginStatsTable';
import LoginChartsSection from '@/components/admin/LoginChartsSection';
import ServiceIntegrationsManagement from '@/components/admin/ServiceIntegrationsManagement';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState("users");

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin dashboard.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome to the Admin Dashboard</AlertTitle>
          <AlertDescription>
            This area provides administrator tools for managing the TipTop platform. Access is restricted to admin users only.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="services">Service Integrations</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-8">
            <LoginStatsSummary />
            <LoginChartsSection />
            <LoginStatsTable />
          </TabsContent>
          
          <TabsContent value="services">
            <ServiceIntegrationsManagement />
          </TabsContent>
          
          <TabsContent value="properties">
            <div className="p-8 border rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Property Management</h3>
              <p className="text-muted-foreground">
                Property management features are coming soon in Phase 2 of development.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
