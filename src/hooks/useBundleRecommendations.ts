
import { useState, useEffect } from 'react';
import { BundleRecommendation, BundleConfiguration, ServiceProvider } from '@/contexts/ServiceProviders/types';
import { supabase } from '@/integrations/supabase/client';

export const useBundleRecommendations = (detectedAssets: string[]) => {
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch bundle configurations from database
        const { data: bundlesData, error: bundlesError } = await supabase
          .from('bundle_configurations')
          .select('*')
          .eq('is_active', true);

        if (bundlesError) throw bundlesError;

        // Fetch service providers from database
        const { data: providersData, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .eq('is_active', true);

        if (providersError) throw providersError;

        const bundles: BundleConfiguration[] = bundlesData || [];
        const providers: ServiceProvider[] = providersData || [];

        // Filter bundles based on detected assets
        const filteredBundles = bundles.filter(bundle => {
          const assetRequirements = Array.isArray(bundle.asset_requirements) 
            ? bundle.asset_requirements 
            : JSON.parse(bundle.asset_requirements as string || '[]');
          
          const matchingAssets = assetRequirements.filter((asset: string) => 
            detectedAssets.includes(asset)
          );
          return matchingAssets.length >= bundle.min_assets;
        });

        // Create recommendations
        const bundleRecommendations: BundleRecommendation[] = filteredBundles.map(bundle => {
          const assetRequirements = Array.isArray(bundle.asset_requirements) 
            ? bundle.asset_requirements 
            : JSON.parse(bundle.asset_requirements as string || '[]');

          const relevantProviders = providers.filter(provider => 
            assetRequirements.includes(provider.category)
          );

          const matchingAssets = assetRequirements.filter((asset: string) => 
            detectedAssets.includes(asset)
          );

          return {
            bundle,
            providers: relevantProviders,
            totalEarnings: {
              low: Number(bundle.total_monthly_earnings_low),
              high: Number(bundle.total_monthly_earnings_high)
            },
            matchingAssets,
            setupCost: Number(bundle.total_setup_cost)
          };
        });

        setRecommendations(bundleRecommendations);
      } catch (err) {
        console.error('Error fetching bundle recommendations:', err);
        setError('Failed to load bundle recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [detectedAssets]);

  return {
    recommendations,
    isLoading,
    error
  };
};
