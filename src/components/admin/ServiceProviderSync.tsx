
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncResult {
  success: boolean;
  summary?: {
    added: number;
    updated: number;
    duplicatesRemoved: number;
    totalProviders: number;
  };
  message: string;
  error?: string;
}

const ServiceProviderSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting service provider sync...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/functions/v1/sync-service-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      setLastSyncResult(result);

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message,
        });
        console.log('✅ Service provider sync completed:', result);
      } else {
        throw new Error(result.error || 'Sync failed');
      }

    } catch (error) {
      console.error('❌ Service provider sync failed:', error);
      const errorResult: SyncResult = {
        success: false,
        message: 'Sync failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setLastSyncResult(errorResult);
      
      toast({
        title: "Sync Failed",
        description: errorResult.error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Service Provider Sync
        </CardTitle>
        <CardDescription>
          Sync missing service providers and clean up duplicate entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Service Providers
            </>
          )}
        </Button>

        {lastSyncResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {lastSyncResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {lastSyncResult.success ? 'Last Sync: Success' : 'Last Sync: Failed'}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {lastSyncResult.message}
            </p>

            {lastSyncResult.success && lastSyncResult.summary && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Added: {lastSyncResult.summary.added}
                </Badge>
                <Badge variant="outline">
                  Updated: {lastSyncResult.summary.updated}
                </Badge>
                <Badge variant="outline">
                  Duplicates Removed: {lastSyncResult.summary.duplicatesRemoved}
                </Badge>
                <Badge variant="secondary">
                  Total: {lastSyncResult.summary.totalProviders}
                </Badge>
              </div>
            )}

            {lastSyncResult.error && (
              <p className="text-sm text-red-600">
                Error: {lastSyncResult.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceProviderSync;
