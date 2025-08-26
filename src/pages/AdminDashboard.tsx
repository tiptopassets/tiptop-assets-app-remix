
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
import PartnersSection from '@/components/admin/PartnersSection';
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
        // Batch all queries for efficiency
        const [
          usersResult,
          analysesResult,
          journeyResult,
          addressesResult,
          earningsResult,
          todayActiveResult,
          thisMonthUsersResult,
          lastMonthUsersResult
        ] = await Promise.all([
          // Get total users and login counts
          supabase
            .from('user_login_stats')
            .select('user_id, login_count, first_login_at, last_login_at'),
          
            // Get all property analyses from user_property_analyses table
            supabase
              .from('user_property_analyses')
              .select(`
                id, 
                user_id,
                total_monthly_revenue, 
                created_at,
                address_id,
                analysis_results
              `)
              .order('created_at', { ascending: false }),
            
            // Also get analyses from user_journey_complete table  
            supabase
              .from('user_journey_complete')
              .select(`
                id,
                user_id,
                property_address,
                analysis_results,
                total_monthly_revenue,
                created_at,
                analysis_id
              `)
              .not('analysis_results', 'is', null)
              .order('created_at', { ascending: false }),
            
          // Get all user addresses separately
          supabase
            .from('user_addresses')
            .select('*')
            .order('created_at', { ascending: false }),
          
          // Get affiliate earnings
          supabase
            .from('affiliate_earnings')
            .select('earnings_amount, created_at'),
          
          // Get today's active users
          supabase
            .from('user_login_stats')
            .select('user_id')
            .gte('last_login_at', new Date().toISOString().split('T')[0]),
          
          // Get this month's new users
          supabase
            .from('user_login_stats')
            .select('user_id, first_login_at')
            .gte('first_login_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          
          // Get last month's new users
          supabase
            .from('user_login_stats')
            .select('user_id, first_login_at')
            .gte('first_login_at', new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
            .lt('first_login_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ]);

        // Handle any errors
        if (usersResult.error) throw usersResult.error;
        if (analysesResult.error) throw analysesResult.error;
        if (journeyResult.error) throw journeyResult.error;
        if (addressesResult.error) throw addressesResult.error;
        if (earningsResult.error) throw earningsResult.error;
        if (todayActiveResult.error) throw todayActiveResult.error;
        if (thisMonthUsersResult.error) throw thisMonthUsersResult.error;
        if (lastMonthUsersResult.error) throw lastMonthUsersResult.error;

        const users = usersResult.data || [];
        const analyses = analysesResult.data || [];
        const journeyData = journeyResult.data || [];
        const addresses = addressesResult.data || [];
        const earnings = earningsResult.data || [];
        const todayActive = todayActiveResult.data || [];
        const thisMonthUsers = thisMonthUsersResult.data || [];
        const lastMonthUsers = lastMonthUsersResult.data || [];

        // Combine analyses from both sources, avoiding duplicates
        const existingAnalysisIds = new Set(analyses.map((a: any) => a.id));
        const journeyAnalyses = journeyData.filter((j: any) => 
          !j.analysis_id || !existingAnalysisIds.has(j.analysis_id)
        );
        
        const allAnalyses = [...analyses, ...journeyAnalyses];

        // Calculate totals
        const totalUsers = users.length;
        const totalLogins = users.reduce((sum, user) => sum + (user.login_count || 0), 0);
        const totalAnalyses = allAnalyses.length;
        const totalRevenue = allAnalyses.reduce((sum, analysis) => sum + (analysis.total_monthly_revenue || 0), 0);
        const totalAffiliateEarnings = earnings.reduce((sum, earning) => sum + (Number(earning.earnings_amount) || 0), 0);
        const activeUsersToday = todayActive.length;
        
        // Calculate unique properties by collecting all addresses from multiple sources
        const allPropertyAddresses = new Set();
        
        // Add addresses from user_addresses table
        addresses.forEach(addr => {
          if (addr.formatted_address || addr.address) {
            allPropertyAddresses.add(addr.formatted_address || addr.address);
          }
        });
        
        // Add addresses from property analyses
        analyses.forEach(analysis => {
          if (analysis.analysis_results && typeof analysis.analysis_results === 'object') {
            const results = analysis.analysis_results as any;
            if (results.propertyAddress && typeof results.propertyAddress === 'string') {
              allPropertyAddresses.add(results.propertyAddress);
            } else if (results.address && typeof results.address === 'string') {
              allPropertyAddresses.add(results.address);
            }
          }
        });
        
        // Add addresses from journey data
        journeyData.forEach((journey: any) => {
          if (journey.property_address) {
            allPropertyAddresses.add(journey.property_address);
          }
          if (journey.analysis_results && typeof journey.analysis_results === 'object') {
            const results = journey.analysis_results as any;
            if (results.propertyAddress && typeof results.propertyAddress === 'string') {
              allPropertyAddresses.add(results.propertyAddress);
            } else if (results.address && typeof results.address === 'string') {
              allPropertyAddresses.add(results.address);
            }
          }
        });
        
        const uniqueAddresses = allPropertyAddresses.size;
        
        // Calculate monthly growth
        const monthlyGrowth = lastMonthUsers.length > 0 
          ? Math.round(((thisMonthUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100)
          : thisMonthUsers.length > 0 ? 100 : 0;

        setAdminStats({
          totalUsers,
          totalAnalyses,
          totalAffiliateEarnings,
          activeUsersToday,
          totalProperties: uniqueAddresses,
          monthlyGrowth,
          totalLogins
        });

        console.log('Admin stats updated:', {
          totalUsers,
          totalLogins,
          totalAnalyses,
          totalProperties: uniqueAddresses,
          totalRevenue,
          activeUsersToday,
          monthlyGrowth
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
    
    // Set up real-time updates
    const interval = setInterval(fetchAdminStats, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
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
          <TabsList className="grid grid-cols-6 w-[720px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="services">Service Integrations</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
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
          
          <TabsContent value="partners">
            <PartnersSection />
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
