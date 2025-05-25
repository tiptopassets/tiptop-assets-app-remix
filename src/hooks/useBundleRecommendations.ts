
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BundleConfiguration, ServiceProvider, BundleRecommendation } from '@/contexts/ServiceProviders/types';

export const useBundleRecommendations = (detectedAssets: string[]) => {
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (detectedAssets.length === 0) return;
    
    fetchBundleRecommendations();
  }, [detectedAssets]);

  const fetchBundleRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all active bundle configurations
      const { data: bundles, error: bundleError } = await supabase
        .from('bundle_configurations')
        .select('*')
        .eq('is_active', true)
        .order('total_monthly_earnings_high', { ascending: false });

      if (bundleError) throw bundleError;

      // Fetch all active service providers
      const { data: providers, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (providerError) throw providerError;

      // Generate recommendations based on detected assets
      const bundleRecommendations: BundleRecommendation[] = [];

      for (const bundle of bundles || []) {
        // Handle the Json type properly by parsing the asset requirements
        let requiredAssets: string[] = [];
        try {
          if (typeof bundle.asset_requirements === 'string') {
            requiredAssets = JSON.parse(bundle.asset_requirements);
          } else if (Array.isArray(bundle.asset_requirements)) {
            requiredAssets = bundle.asset_requirements as string[];
          }
        } catch (e) {
          console.error('Error parsing asset requirements:', e);
          continue;
        }

        const matchingAssets = detectedAssets.filter(asset => 
          requiredAssets.includes(asset)
        );

        // Only recommend if we have enough matching assets
        if (matchingAssets.length >= bundle.min_assets) {
          // Get providers for matching assets
          const bundleProviders = (providers || []).filter(provider =>
            matchingAssets.includes(provider.category)
          );

          // Limit providers per asset type
          const limitedProviders: ServiceProvider[] = [];
          const assetProviderCount: Record<string, number> = {};

          for (const provider of bundleProviders) {
            const count = assetProviderCount[provider.category] || 0;
            if (count < bundle.max_providers_per_asset) {
              limitedProviders.push(provider);
              assetProviderCount[provider.category] = count + 1;
            }
          }

          // Calculate total earnings and setup cost
          const totalEarnings = limitedProviders.reduce(
            (acc, provider) => ({
              low: acc.low + provider.avg_monthly_earnings_low,
              high: acc.high + provider.avg_monthly_earnings_high
            }),
            { low: 0, high: 0 }
          );

          const setupCost = limitedProviders.reduce(
            (acc, provider) => acc + provider.setup_cost,
            0
          );

          // Create properly typed bundle configuration
          const typedBundle: BundleConfiguration = {
            id: bundle.id,
            name: bundle.name,
            description: bundle.description || '',
            asset_requirements: requiredAssets,
            min_assets: bundle.min_assets,
            max_providers_per_asset: bundle.max_providers_per_asset,
            total_setup_cost: bundle.total_setup_cost,
            total_monthly_earnings_low: bundle.total_monthly_earnings_low,
            total_monthly_earnings_high: bundle.total_monthly_earnings_high,
            is_active: bundle.is_active
          };

          bundleRecommendations.push({
            bundle: typedBundle,
            providers: limitedProviders,
            totalEarnings,
            matchingAssets,
            setupCost
          });
        }
      }

      // Sort by potential earnings (high estimate)
      bundleRecommendations.sort((a, b) => b.totalEarnings.high - a.totalEarnings.high);

      setRecommendations(bundleRecommendations);
    } catch (err) {
      console.error('Error fetching bundle recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    error,
    refetch: fetchBundleRecommendations
  };
};
