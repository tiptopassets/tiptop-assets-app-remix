
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchLoginStats = async () => {
      try {
        // Fetch user login statistics with user emails
        const { data, error } = await supabase
          .from('user_login_stats')
          .select('*')
          .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1)
          .order('last_login_at', { ascending: false });

        if (error) throw error;

        // For each login stat, fetch the user email
        const statsWithUserDetails = await Promise.all(
          data.map(async (stat) => {
            // Get user details from auth.users (using admin API or retrieve from profiles table)
            // Note: In a real app, you might need to create a profiles table or use a function
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(stat.user_id);
            
            return {
              ...stat,
              user_email: userData?.user?.email || 'Unknown Email'
            };
          })
        );

        setLoginStats(statsWithUserDetails);
      } catch (error) {
        console.error('Error fetching login stats:', error);
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
          // Refresh data when changes happen
          fetchLoginStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, rowsPerPage]);

  // Format the user agent into a more readable format
  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    
    // Simple parsing - in a real app you might use a library
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    
    return 'Other Browser';
  };

  // Generate skeleton loading rows
  const skeletonRows = Array(rowsPerPage).fill(0).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
    </TableRow>
  ));

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Logins</TableHead>
              <TableHead>First Login</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Browser</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              skeletonRows
            ) : loginStats.length > 0 ? (
              loginStats.map((stat) => (
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
          Showing {loginStats.length > 0 ? page * rowsPerPage + 1 : 0} to {page * rowsPerPage + loginStats.length} of many entries
        </div>
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
            disabled={loginStats.length < rowsPerPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
