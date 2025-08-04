
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BundleConfiguration, BundleRecommendation, ServiceProvider } from '@/contexts/ServiceProviders/types';

export const useBundleRecommendations = (selectedAssets: string[] = []) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAssets.length > 0) {
      fetchRecommendations();
    }
  }, [selectedAssets]);

  const fetchRecommendations = async () => {
    if (!user || selectedAssets.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch bundle configurations
      const { data: bundles, error: bundlesError } = await supabase
        .from('bundle_configurations')
        .select('*')
        .eq('is_active', true);

      if (bundlesError) throw bundlesError;

      // Fetch service providers with the new columns
      const { data: providers, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true);

      if (providersError) throw providersError;

      // Filter bundles that match selected assets and convert types
      const matchingBundles: BundleRecommendation[] = (bundles || [])
        .map(bundle => {
          // Bundle now has proper structure from database
          const bundleConfig: BundleConfiguration = {
            id: bundle.id,
            name: bundle.name,
            description: bundle.description || '',
            asset_requirements: Array.isArray(bundle.asset_requirements) 
              ? bundle.asset_requirements 
              : [],
            min_assets: bundle.min_assets || 1,
            max_providers_per_asset: bundle.max_providers_per_asset || 3,
            total_setup_cost: bundle.total_setup_cost || 0,
            total_monthly_earnings_low: bundle.total_monthly_earnings_low || 0,
            total_monthly_earnings_high: bundle.total_monthly_earnings_high || 0,
            is_active: bundle.is_active || true
          };

          const matchingAssets = bundleConfig.asset_requirements.filter(asset => 
            selectedAssets.includes(asset)
          );

          // Only include if bundle requirements are met
          if (matchingAssets.length >= bundleConfig.min_assets) {
            // Get relevant providers for this bundle and transform them to ServiceProvider type
            const bundleProviders: ServiceProvider[] = (providers || [])
              .filter(provider => bundleConfig.asset_requirements.some(asset => provider.category === asset))
              .map(provider => ({
                id: provider.id,
                name: provider.name,
                category: provider.category,
                description: provider.description || '',
                logo_url: provider.logo_url,
                website_url: provider.website_url,
                affiliate_program_url: provider.affiliate_program_url,
                referral_link_template: provider.referral_link_template,
                commission_rate: provider.commission_rate,
                setup_cost: provider.setup_cost,
                avg_monthly_earnings_low: provider.avg_monthly_earnings_low,
                avg_monthly_earnings_high: provider.avg_monthly_earnings_high,
                conversion_rate: provider.conversion_rate || 2.5,
                priority: provider.priority,
                is_active: provider.is_active
              }));

            return {
              bundle: bundleConfig,
              providers: bundleProviders,
              totalEarnings: {
                low: bundleConfig.total_monthly_earnings_low,
                high: bundleConfig.total_monthly_earnings_high
              },
              matchingAssets,
              setupCost: bundleConfig.total_setup_cost
            };
          }
          return null;
        })
        .filter(Boolean) as BundleRecommendation[];

      // Sort by potential earnings
      matchingBundles.sort((a, b) => b.totalEarnings.high - a.totalEarnings.high);

      setRecommendations(matchingBundles);
    } catch (err) {
      console.error('Error fetching bundle recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const selectBundle = async (bundleId: string, propertyAddress: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_bundle_selections')
        .insert({
          user_id: user.id,
          bundle_name: bundleId,
          property_address: propertyAddress,
          bundle_data: { assets: selectedAssets, providers: [] }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error selecting bundle:', err);
      throw err;
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    selectBundle,
    refetch: fetchRecommendations
  };
};
