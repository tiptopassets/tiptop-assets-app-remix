
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type LoginStats = {
  id: string;
  user_id: string;
  login_count: number;
  first_login_at: string;
  last_login_at: string;
  last_user_agent: string | null;
  last_ip: string | null;
  user_email?: string;
  user_display_name?: string;
};

export const LoginStatsTable = () => {
  const [loginStats, setLoginStats] = useState<LoginStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginStats = async () => {
      try {
        console.log('📊 [LOGIN-STATS] Fetching all login statistics...');
        
        // Get all user login statistics
        const { data: loginData, error } = await supabase
          .from('user_login_stats')
          .select('*')
          .order('last_login_at', { ascending: false });

        if (error) throw error;

        console.log('📊 [LOGIN-STATS] Raw login data:', loginData);

        if (!loginData || loginData.length === 0) {
          console.log('📊 [LOGIN-STATS] No login data found');
          setLoginStats([]);
          setLoading(false);
          return;
        }

        // Get user IDs for fetching additional info
        const userIds = loginData.map(stat => stat.user_id);
        console.log('📊 [LOGIN-STATS] User IDs:', userIds);

        // Try to get user emails from auth.users (this might not work due to RLS)
        let userEmails: any[] = [];
        try {
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          userEmails = authUsers?.users || [];
          console.log('📊 [LOGIN-STATS] Auth users found:', userEmails.length);
        } catch (authError) {
          console.warn('📊 [LOGIN-STATS] Could not fetch auth users:', authError);
        }

        // Get additional user info from journey data as fallback
        let journeyData: any[] = [];
        if (userIds.length > 0) {
          const { data: journeyUsers } = await supabase
            .from('user_journey_complete')
            .select('user_id, property_address, created_at')
            .in('user_id', userIds)
            .not('user_id', 'is', null);
          
          journeyData = journeyUsers || [];
          console.log('📊 [LOGIN-STATS] Journey data found:', journeyData.length);
        }

        // Combine login stats with user info
        const statsWithUserDetails = loginData.map((stat, index) => {
          // Try to find user email from auth data
          const authUser = userEmails.find(u => u.id === stat.user_id);
          const userEmail = authUser?.email;

          // Try to find property address from journey data
          const journeyInfo = journeyData.find(j => j.user_id === stat.user_id);
          const propertyAddress = journeyInfo?.property_address;

          // Create display name
          let displayName = '';
          if (userEmail) {
            displayName = userEmail;
          } else if (propertyAddress) {
            displayName = `Property: ${propertyAddress.substring(0, 30)}...`;
          } else {
            displayName = `User ${index + 1} (ID: ${stat.user_id.substring(0, 8)}...)`;
          }

          return {
            ...stat,
            user_email: userEmail || 'Unknown Email',
            user_display_name: displayName
          };
        });

        console.log('✅ [LOGIN-STATS] Final stats with user details:', statsWithUserDetails);
        setLoginStats(statsWithUserDetails);
      } catch (error) {
        console.error('❌ [LOGIN-STATS] Error fetching login stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load login statistics.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLoginStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('login-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_login_stats',
        },
        () => {
          console.log('🔄 [LOGIN-STATS] Real-time update detected, refreshing...');
          fetchLoginStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Format the user agent into a more readable format
  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    
    return 'Other Browser';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Logins</TableHead>
                <TableHead>First Login</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Browser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Logins</TableHead>
              <TableHead>First Login</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Browser</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No login statistics found
                </TableCell>
              </TableRow>
            ) : (
              loginStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div>
                      <div className="font-medium">{stat.user_display_name}</div>
                      {stat.user_email !== 'Unknown Email' && (
                        <div className="text-sm text-muted-foreground">{stat.user_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{stat.login_count}</span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(stat.first_login_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(stat.last_login_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{formatUserAgent(stat.last_user_agent)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-gray-500">
        Showing {loginStats.length} users with login activity
      </div>
    </div>
  );
};
