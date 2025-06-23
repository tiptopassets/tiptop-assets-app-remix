
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BundleRecommendation {
  id: string;
  name: string;
  description: string;
  totalSetupCost: number;
  monthlyEarningsLow: number;
  monthlyEarningsHigh: number;
  assets: string[];
  providers: Array<{
    id: string;
    name: string;
    category: string;
    setupCost: number;
    monthlyEarningsLow: number;
    monthlyEarningsHigh: number;
  }>;
  roiMonths: number;
  selected?: boolean;
}

export const useBundleRecommendations = (propertyAnalysis?: any) => {
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch bundle configurations
        const { data: bundleConfigs, error: bundleError } = await supabase
          .from('bundle_configurations')
          .select('*')
          .eq('is_active', true)
          .order('total_monthly_earnings_high', { ascending: false });

        if (bundleError) throw bundleError;

        // Fetch service providers
        const { data: serviceProviders, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .eq('is_active', true);

        if (providersError) throw providersError;

        // Fetch user's existing bundle selections
        let userSelections: any[] = [];
        try {
          const { data: selectionsData, error: selectionsError } = await supabase
            .from('user_bundle_selections')
            .select('*')
            .eq('user_id', user.id);

          if (selectionsError) {
            console.warn('Could not fetch user bundle selections:', selectionsError);
            // Continue without user selections if table doesn't exist yet
          } else {
            userSelections = selectionsData || [];
          }
        } catch (err) {
          console.warn('Bundle selections table not available yet:', err);
        }

        const selectedBundleIds = new Set(userSelections.map(s => s.bundle_id));

        // Transform bundle configurations into recommendations
        const bundleRecommendations: BundleRecommendation[] = (bundleConfigs || []).map(bundle => {
          const assetRequirements = Array.isArray(bundle.asset_requirements) 
            ? bundle.asset_requirements as string[]
            : [];
            
          // Find relevant providers for this bundle's asset requirements
          const relevantProviders = (serviceProviders || [])
            .filter(provider => 
              assetRequirements.some(asset => 
                provider.category?.toLowerCase().includes(asset.toLowerCase()) ||
                provider.name?.toLowerCase().includes(asset.toLowerCase())
              )
            )
            .slice(0, bundle.max_providers_per_asset)
            .map(provider => ({
              id: provider.id,
              name: provider.name,
              category: provider.category,
              setupCost: provider.setup_cost || 0,
              monthlyEarningsLow: provider.avg_monthly_earnings_low || 0,
              monthlyEarningsHigh: provider.avg_monthly_earnings_high || 0,
            }));

          const roiMonths = bundle.total_setup_cost > 0 
            ? Math.ceil(bundle.total_setup_cost / (bundle.total_monthly_earnings_low || 1))
            : 0;

          return {
            id: bundle.id,
            name: bundle.name,
            description: bundle.description || '',
            totalSetupCost: bundle.total_setup_cost || 0,
            monthlyEarningsLow: bundle.total_monthly_earnings_low || 0,
            monthlyEarningsHigh: bundle.total_monthly_earnings_high || 0,
            assets: assetRequirements,
            providers: relevantProviders,
            roiMonths,
            selected: selectedBundleIds.has(bundle.id)
          };
        });

        setRecommendations(bundleRecommendations);
      } catch (err) {
        console.error('Error fetching bundle recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bundle recommendations');
        toast({
          title: 'Error',
          description: 'Failed to load bundle recommendations',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, toast]);

  const selectBundle = async (bundleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_bundle_selections')
        .insert({
          user_id: user.id,
          bundle_id: bundleId,
          selection_status: 'selected'
        });

      if (error) throw error;

      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === bundleId ? { ...rec, selected: true } : rec
        )
      );

      toast({
        title: 'Success',
        description: 'Bundle selected successfully'
      });
    } catch (err) {
      console.error('Error selecting bundle:', err);
      toast({
        title: 'Error',
        description: 'Failed to select bundle',
        variant: 'destructive'
      });
    }
  };

  const deselectBundle = async (bundleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_bundle_selections')
        .delete()
        .eq('user_id', user.id)
        .eq('bundle_id', bundleId);

      if (error) throw error;

      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === bundleId ? { ...rec, selected: false } : rec
        )
      );

      toast({
        title: 'Success',
        description: 'Bundle deselected successfully'
      });
    } catch (err) {
      console.error('Error deselecting bundle:', err);
      toast({
        title: 'Error',
        description: 'Failed to deselect bundle',
        variant: 'destructive'
      });
    }
  };

  return {
    recommendations,
    loading,
    error,
    selectBundle,
    deselectBundle,
    refetch: () => {
      setLoading(true);
      // Re-trigger the effect by updating a dependency
    }
  };
};
