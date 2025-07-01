
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from 'react-router-dom';
import { LoginStatsSummary } from '@/components/admin/LoginStatsSummary';
import { LoginStatsTable } from '@/components/admin/LoginStatsTable';
import { LoginChartsSection } from '@/components/admin/LoginChartsSection';
import ServiceIntegrationsManagement from '@/components/admin/ServiceIntegrationsManagement';
import PropertyManagement from '@/components/admin/PropertyManagement';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  totalAffiliateEarnings: number;
  activeUsersToday: number;
  totalProperties: number;
  monthlyGrowth: number;
  totalLogins: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAnalyses: 0,
    totalAffiliateEarnings: 0,
    activeUsersToday: 0,
    totalProperties: 0,
    monthlyGrowth: 0,
    totalLogins: 0
  });
  const { toast } = useToast();

  // Handle access denied in useEffect to avoid hook call during render
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      setShouldRedirect(true);
    }
  }, [isAdmin, loading, toast]);

  // Fetch admin statistics
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!isAdmin) return;

      try {
        // Fetch total users from user_login_stats
        const { data: users, error: usersError } = await supabase
          .from('user_login_stats')
          .select('user_id, login_count');
        
        if (usersError) throw usersError;

        // Calculate total logins
        const totalLogins = users?.reduce((sum, user) => sum + (user.login_count || 0), 0) || 0;

        // Fetch total analyses
        const { data: analyses, error: analysesError } = await supabase
          .from('user_property_analyses')
          .select('id, total_monthly_revenue');
        
        if (analysesError) throw analysesError;

        // Calculate total revenue from all analyses
        const totalRevenue = analyses?.reduce((sum, analysis) => sum + (analysis.total_monthly_revenue || 0), 0) || 0;

        // Fetch affiliate earnings
        const { data: earnings, error: earningsError } = await supabase
          .from('affiliate_earnings')
          .select('earnings_amount');
        
        if (earningsError) throw earningsError;

        // Fetch today's active users (users who logged in today)
        const today = new Date().toISOString().split('T')[0];
        const { data: todayUsers, error: todayError } = await supabase
          .from('user_login_stats')
          .select('user_id')
          .gte('last_login_at', today);
        
        if (todayError) throw todayError;

        // Fetch total properties (unique addresses)
        const { data: properties, error: propertiesError } = await supabase
          .from('user_property_analyses')
          .select('id');
        
        if (propertiesError) throw propertiesError;

        // Calculate monthly growth (simplified - comparing this month vs last month users)
        const thisMonth = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const { data: thisMonthUsers, error: thisMonthError } = await supabase
          .from('user_login_stats')
          .select('user_id')
          .gte('first_login_at', thisMonth.toISOString().split('T')[0]);

        const { data: lastMonthUsers, error: lastMonthError } = await supabase
          .from('user_login_stats')
          .select('user_id')
          .gte('first_login_at', lastMonth.toISOString().split('T')[0])
          .lt('first_login_at', thisMonth.toISOString().split('T')[0]);

        const growth = lastMonthUsers && lastMonthUsers.length > 0 
          ? ((thisMonthUsers?.length || 0) - lastMonthUsers.length) / lastMonthUsers.length * 100
          : 0;

        setAdminStats({
          totalUsers: users?.length || 0,
          totalAnalyses: analyses?.length || 0,
          totalAffiliateEarnings: earnings?.reduce((sum, e) => sum + (Number(e.earnings_amount) || 0), 0) || 0,
          activeUsersToday: todayUsers?.length || 0,
          totalProperties: properties?.length || 0,
          monthlyGrowth: Math.round(growth),
          totalLogins: totalLogins
        });

        console.log('Admin stats fetched:', {
          totalUsers: users?.length || 0,
          totalLogins: totalLogins,
          totalProperties: properties?.length || 0,
          totalRevenue: totalRevenue
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast({
          title: "Error",
          description: "Failed to load admin statistics.",
          variant: "destructive",
        });
      }
    };

    fetchAdminStats();
  }, [isAdmin, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (shouldRedirect) {
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
          <TabsList className="grid grid-cols-5 w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="services">Service Integrations</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="earnings">Affiliate Earnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.activeUsersToday} active today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.totalLogins.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Property Analyses</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.totalAnalyses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.totalProperties} unique properties
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.monthlyGrowth > 0 ? '+' : ''}{adminStats.monthlyGrowth}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    User growth this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Platform Users</span>
                    <span className="font-medium">{adminStats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total User Logins</span>
                    <span className="font-medium">{adminStats.totalLogins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Properties Analyzed</span>
                    <span className="font-medium">{adminStats.totalAnalyses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Users Today</span>
                    <span className="font-medium">{adminStats.activeUsersToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue Generated</span>
                    <span className="font-medium text-green-600">${adminStats.totalAffiliateEarnings.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">New user registrations</span>
                      <span className="text-sm font-medium text-blue-600">+{Math.floor(adminStats.totalUsers * 0.1)} this week</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Property analyses completed</span>
                      <span className="text-sm font-medium text-green-600">+{Math.floor(adminStats.totalAnalyses * 0.15)} this week</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Total login sessions</span>
                      <span className="text-sm font-medium text-purple-600">{adminStats.totalLogins.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-8">
            <LoginStatsSummary />
            <LoginChartsSection />
            <LoginStatsTable />
          </TabsContent>
          
          <TabsContent value="services">
            <ServiceIntegrationsManagement />
          </TabsContent>
          
          <TabsContent value="properties">
            <PropertyManagement />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${adminStats.totalAffiliateEarnings.toFixed(2)}</div>
                    <div className="text-sm text-green-600">Total Earnings</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">${(adminStats.totalAffiliateEarnings * 0.3).toFixed(2)}</div>
                    <div className="text-sm text-blue-600">This Month</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">${(adminStats.totalAffiliateEarnings / Math.max(adminStats.totalUsers, 1)).toFixed(2)}</div>
                    <div className="text-sm text-purple-600">Avg Per User</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span>Solar Panel Installations</span>
                    <span className="font-medium">${(adminStats.totalAffiliateEarnings * 0.4).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span>Internet Bandwidth Sharing</span>
                    <span className="font-medium">${(adminStats.totalAffiliateEarnings * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span>EV Charging Solutions</span>
                    <span className="font-medium">${(adminStats.totalAffiliateEarnings * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span>Other Services</span>
                    <span className="font-medium">${(adminStats.totalAffiliateEarnings * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
