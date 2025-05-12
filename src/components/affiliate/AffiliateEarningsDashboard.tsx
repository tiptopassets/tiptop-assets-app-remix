
import React, { useEffect, useState } from 'react';
import { useAffiliateEarnings } from '@/hooks/useAffiliateEarnings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AffiliateEarningsDashboard: React.FC = () => {
  const { earnings, services, loading, error, refreshData } = useAffiliateEarnings();
  const [isSyncing, setIsSyncing] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  // Check if Chrome extension is installed
  useEffect(() => {
    // Only check for extension in browser environment
    const checkExtension = () => {
      if (typeof window !== 'undefined') {
        try {
          // Safe check for chrome object and its properties
          const chromeObj = window as any;
          if (chromeObj.chrome && chromeObj.chrome.runtime) {
            chromeObj.chrome.runtime.sendMessage(
              'extension-id-here', // Replace with actual extension ID
              { action: 'checkInstalled' },
              (response: any) => {
                if (response && !chromeObj.chrome.runtime.lastError) {
                  setExtensionInstalled(true);
                }
              }
            );
          }
        } catch (err) {
          console.log('Extension not installed or error checking:', err);
        }
      }
    };

    // Safely attempt to check extension
    try {
      checkExtension();
    } catch (err) {
      console.log('Error checking extension status:', err);
    }
  }, []);

  // Function to trigger earnings sync
  const syncEarnings = async () => {
    try {
      setIsSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('sync_affiliate_earnings', {
        body: { action: 'sync_all' }
      });
      
      if (error) throw error;
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced earnings from ${data.services_synced || 0} services.`,
      });
      
      // Refetch data to show updated earnings
      refreshData();
      
    } catch (err) {
      console.error('Error syncing earnings:', err);
      toast({
        title: "Sync Failed",
        description: "There was a problem syncing your affiliate earnings.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card className="w-full max-w-md glass-effect">
        <CardHeader>
          <CardTitle>Loading Earnings...</CardTitle>
          <CardDescription>Fetching your affiliate earnings. Please wait.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full max-w-md glass-effect">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load affiliate earnings.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center">
          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
          {error.message || 'An unexpected error occurred.'}
        </CardContent>
        <CardFooter>
          <Button onClick={() => refreshData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Calculate total earnings
  const totalEarnings = earnings.reduce((sum, earning) => sum + (earning.earnings || 0), 0);
  
  // Get the most recent update time
  const lastUpdated = earnings.length > 0 
    ? earnings.reduce((latest, earning) => {
        if (!latest || (earning.updated_at && new Date(earning.updated_at) > new Date(latest))) {
          return earning.updated_at;
        }
        return latest;
      }, '')
    : 'N/A';

  // Render earnings data
  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader>
        <CardTitle>Affiliate Earnings</CardTitle>
        <CardDescription>Your total affiliate earnings across all platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-lg font-semibold">Total Earnings: ${totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Last Updated: {lastUpdated || 'N/A'}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button onClick={() => refreshData()} disabled={isSyncing}>
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Earnings
            </>
          )}
        </Button>
        {!extensionInstalled && (
          <Button variant="destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            Extension Required
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AffiliateEarningsDashboard;
