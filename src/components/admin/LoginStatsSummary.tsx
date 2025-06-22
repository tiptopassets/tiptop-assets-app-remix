
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type SummaryStats = {
  totalUsers: number;
  totalLogins: number;
  activeToday: number;
  averageLoginsPerUser: number;
  mostRecentLogin: string | null;
};

export const LoginStatsSummary = () => {
  const [stats, setStats] = useState<SummaryStats>({
    totalUsers: 0,
    totalLogins: 0,
    activeToday: 0,
    averageLoginsPerUser: 0,
    mostRecentLogin: null,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSummaryStats = async () => {
      try {
        // Get total users count
        const { count: totalUsersCount, error: usersError } = await supabase
          .from('user_login_stats')
          .select('*', { count: 'exact', head: true });
          
        if (usersError) throw usersError;
        
        // Get sum of all logins using the RPC function
        const { data: loginCountData, error: loginError } = await supabase
          .rpc('sum_login_count');
          
        // Safely extract the numeric value from the response
        const totalLogins = typeof loginCountData === 'number' ? loginCountData : 0;
        
        if (loginError) throw loginError;
        
        // Get active users today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: activeTodayCount, error: activeError } = await supabase
          .from('user_login_stats')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', today.toISOString());
          
        if (activeError) throw activeError;
        
        // Get most recent login
        const { data: recentLogins, error: recentError } = await supabase
          .from('user_login_stats')
          .select('last_login_at')
          .order('last_login_at', { ascending: false })
          .limit(1);
          
        if (recentError) throw recentError;
        
        const mostRecentLogin = recentLogins && recentLogins.length > 0 
          ? recentLogins[0].last_login_at 
          : null;
        
        // Calculate average logins per user
        const avgLoginsPerUser = totalUsersCount && totalUsersCount > 0
          ? totalLogins / totalUsersCount
          : 0;
        
        setStats({
          totalUsers: totalUsersCount || 0,
          totalLogins: totalLogins,
          activeToday: activeTodayCount || 0,
          averageLoginsPerUser: avgLoginsPerUser,
          mostRecentLogin: mostRecentLogin,
        });
      } catch (error) {
        console.error('Error fetching summary stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load summary statistics.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummaryStats();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('login-summary-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_login_stats' },
        () => {
          fetchSummaryStats();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const statCardStyle = loading ? "opacity-60 animate-pulse" : "";
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className={statCardStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-gray-500">Registered users</p>
        </CardContent>
      </Card>
      
      <Card className={statCardStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
          <Activity className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLogins}</div>
          <p className="text-xs text-gray-500">All-time login count</p>
        </CardContent>
      </Card>
      
      <Card className={statCardStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeToday}</div>
          <p className="text-xs text-gray-500">Users logged in today</p>
        </CardContent>
      </Card>
      
      <Card className={statCardStyle}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Last Login</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.mostRecentLogin 
              ? format(new Date(stats.mostRecentLogin), 'HH:mm')
              : '--:--'}
          </div>
          <p className="text-xs text-gray-500">
            {stats.mostRecentLogin 
              ? format(new Date(stats.mostRecentLogin), 'MMM d, yyyy')
              : 'No logins recorded'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
