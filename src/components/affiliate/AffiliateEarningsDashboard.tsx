import React, { useState } from 'react';
import { useAffiliateEarnings } from '@/hooks/useAffiliateEarnings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useServiceProviders } from '@/contexts/ServiceProviders';
import { useFlexOffersSubId } from '@/hooks/useFlexOffersSubId';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';
import { supabase } from '@/integrations/supabase/client';
import { useAffiliateIntegration } from '@/hooks/useAffiliateIntegration';

// Imported component modules
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EarningsCard from './EarningsCard';
import FlexOffersSection from './FlexOffersSection';
import DashboardActions from './DashboardActions';

const AffiliateEarningsDashboard: React.FC = () => {
  const { earnings, services, loading, error, refreshData } = useAffiliateEarnings();
  const { connectedProviders } = useServiceProviders();
  const [isSyncing, setIsSyncing] = useState(false);
  const extensionInstalled = useExtensionStatus();
  const { flexoffersSubId } = useFlexOffersSubId();
  const { syncEarnings } = useAffiliateIntegration();

  // Enhanced sync function that uses the new affiliate integration
  const syncAllEarnings = async () => {
    try {
      setIsSyncing(true);
      
      const partners = ['FlexOffers', 'Honeygain', 'Tesla Energy', 'Swimply', 'Airbnb'];
      const syncPromises = partners.map(partner => syncEarnings(partner));
      
      const results = await Promise.allSettled(syncPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced earnings from ${successful} partners.`,
      });
      
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
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState error={error} refreshData={refreshData} />;
  }

  // Get the most recent update time
  const lastUpdated = earnings.length > 0 
    ? earnings.reduce((latest, earning) => {
        if (!latest || (earning.updated_at && new Date(earning.updated_at) > new Date(latest))) {
          return earning.updated_at;
        }
        return latest;
      }, '')
    : 'N/A';
  
  // Check if FlexOffers is connected
  const hasFlexOffers = connectedProviders.some(p => p.id.toLowerCase() === 'flexoffers');

  // Render earnings data
  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader>
        <CardTitle>Affiliate Earnings</CardTitle>
        <CardDescription>Your total affiliate earnings across all platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Earnings summary and breakdown */}
          <EarningsCard earnings={earnings} lastUpdated={lastUpdated} />
          
          {/* FlexOffers section */}
          <FlexOffersSection 
            hasFlexOffers={hasFlexOffers} 
            flexoffersSubId={flexoffersSubId} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <DashboardActions
          isSyncing={isSyncing}
          refreshData={syncAllEarnings} // Use enhanced sync function
          hasFlexOffers={hasFlexOffers}
          extensionInstalled={extensionInstalled}
        />
      </CardFooter>
    </Card>
  );
};

export default AffiliateEarningsDashboard;
