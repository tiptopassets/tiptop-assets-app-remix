
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, Download, Search } from 'lucide-react';
import { LoginStatsTable } from "@/components/admin/LoginStatsTable";
import { LoginStatsSummary } from "@/components/admin/LoginStatsSummary";
import { LoginChartsSection } from "@/components/admin/LoginChartsSection";

type AdminRole = {
  id: string;
  role: string;
  user_id: string;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdminDialog, setShowAdminDialog] = useState<boolean>(false);
  
  // Check if user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        // Check if user has admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (roles && roles.length > 0) {
          setIsAdmin(true);
        } else {
          // Check if there are any admins at all
          const { count } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin');
          
          // If no admins exist, show dialog to make this user the first admin
          if (count === 0) {
            setShowAdminDialog(true);
          } else {
            navigate('/dashboard'); // Redirect non-admins
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin dashboard.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Failed to verify admin privileges.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const makeUserAdmin = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;
      
      setIsAdmin(true);
      setShowAdminDialog(false);
      toast({
        title: "Admin Access Granted",
        description: "You are now an administrator.",
      });
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({
        title: "Error",
        description: "Failed to set admin privileges.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin && !showAdminDialog) {
    return null; // Navigation happens in the useEffect
  }

  return (
    <>
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Become an Administrator</DialogTitle>
            <DialogDescription>
              No administrators have been set up yet. Would you like to become the first administrator?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={makeUserAdmin}>Become Admin</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <DashboardLayout>
        {isAdmin && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Monitor user login statistics and system activity
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button variant="outline" className="mr-2">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="details">User Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <LoginStatsSummary />
              </TabsContent>
              
              <TabsContent value="charts" className="mt-6">
                <LoginChartsSection />
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>User Login Statistics</CardTitle>
                        <CardDescription>Detailed view of all users' login activity</CardDescription>
                      </div>
                      <div className="mt-4 md:mt-0 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Search users..." 
                          className="pl-10 w-full md:w-64"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LoginStatsTable />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </DashboardLayout>
    </>
  );
};

export default AdminDashboard;
