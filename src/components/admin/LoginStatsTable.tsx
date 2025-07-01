
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
};

export const LoginStatsTable = () => {
  const [loginStats, setLoginStats] = useState<LoginStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50); // Increased to show more users
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchLoginStats = async () => {
      try {
        console.log('📊 [LOGIN-STATS] Fetching all login statistics...');
        
        // Get all user login statistics (no pagination initially)
        const { data: loginData, error, count } = await supabase
          .from('user_login_stats')
          .select('*', { count: 'exact' })
          .order('last_login_at', { ascending: false });

        if (error) throw error;

        console.log('📊 [LOGIN-STATS] Fetched login data:', loginData?.length, 'users');
        setTotalCount(count || 0);

        // Get user profile information from journey data
        const userIds = loginData?.map(stat => stat.user_id) || [];
        
        let userProfiles: any[] = [];
        if (userIds.length > 0) {
          try {
            // Try to get user emails from journey data first
            const { data: journeyProfiles } = await supabase
              .from('user_journey_complete')
              .select('user_id, property_address')
              .in('user_id', userIds)
              .not('user_id', 'is', null);
            
            userProfiles = journeyProfiles || [];
            console.log('👥 [LOGIN-STATS] Found journey profiles:', userProfiles.length);
          } catch (profileError) {
            console.warn('Could not fetch user journey profiles:', profileError);
          }
        }

        // Combine login stats with user info
        const statsWithUserDetails = loginData?.map((stat, index) => {
          const profile = userProfiles.find(p => p.user_id === stat.user_id);
          return {
            ...stat,
            user_email: profile?.property_address || `User ${index + 1} (${stat.user_id.slice(0, 8)}...)` || 'Unknown User'
          };
        }) || [];

        console.log('✅ [LOGIN-STATS] Final stats with user details:', statsWithUserDetails.length);
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

    // Subscribe to real-time updates for user_login_stats table
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

  // Generate skeleton loading rows
  const skeletonRows = Array(5).fill(0).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
    </TableRow>
  ));

  // Display all users without pagination for now
  const displayedStats = loginStats;

  return (
    <div>
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
            {loading ? (
              skeletonRows
            ) : displayedStats.length > 0 ? (
              displayedStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.user_email}</TableCell>
                  <TableCell>{stat.login_count}</TableCell>
                  <TableCell>
                    {format(new Date(stat.first_login_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(stat.last_login_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{formatUserAgent(stat.last_user_agent)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No login statistics found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {displayedStats.length} of {totalCount} users
        </div>
        {totalCount > rowsPerPage && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={displayedStats.length < rowsPerPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
