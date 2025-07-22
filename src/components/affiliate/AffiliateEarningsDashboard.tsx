
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
import AffiliateProgramComingSoon from './AffiliateProgramComingSoon';

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

  // Show the coming soon page instead of the earnings dashboard
  return <AffiliateProgramComingSoon />;
};

export default AffiliateEarningsDashboard;
