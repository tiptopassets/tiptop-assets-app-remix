
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BundleConfiguration, BundleRecommendation, ServiceProvider } from '@/contexts/ServiceProviders/types';

// Temporary type definition until Supabase types are updated
interface BundleConfigurationRow {
  id: string;
  name: string;
  description: string | null;
  asset_requirements: string[] | null;
  min_assets: number | null;
  max_providers_per_asset: number | null;
  total_setup_cost: number | null;
  total_monthly_earnings_low: number | null;
  total_monthly_earnings_high: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface ServiceProviderRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  commission_rate: number;
  setup_cost: number;
  avg_monthly_earnings_low: number;
  avg_monthly_earnings_high: number;
  priority: number;
  is_active: boolean;
  conversion_rate?: number | null;
  referral_link_template?: string | null;
  affiliate_program_url?: string | null;
}

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
      // Fetch bundle configurations using raw query to avoid type issues
      const { data: bundlesData, error: bundlesError } = await supabase
        .rpc('get_bundle_configurations');

      if (bundlesError) {
        console.error('Bundle configurations error:', bundlesError);
        // Fallback to direct table query
        const { data: fallbackBundles, error: fallbackError } = await supabase
          .from('bundle_configurations' as any)
          .select('*')
          .eq('is_active', true);
        
        if (fallbackError) throw fallbackError;
        
        const bundles = fallbackBundles as BundleConfigurationRow[];
        await processBundles(bundles);
      } else {
        const bundles = bundlesData as BundleConfigurationRow[];
        await processBundles(bundles);
      }
    } catch (err) {
      console.error('Error fetching bundle recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const processBundles = async (bundles: BundleConfigurationRow[]) => {
    // Fetch service providers
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('*')
      .eq('is_active', true);

    if (providersError) throw providersError;

    const serviceProviders = providers as ServiceProviderRow[];

    // Filter bundles that match selected assets and convert types
    const matchingBundles: BundleRecommendation[] = bundles
      .map(bundle => {
        // Convert asset_requirements to string array
        const assetRequirements = Array.isArray(bundle.asset_requirements) 
          ? bundle.asset_requirements as string[]
          : [];

        const bundleConfig: BundleConfiguration = {
          id: bundle.id,
          name: bundle.name,
          description: bundle.description || '',
          asset_requirements: assetRequirements,
          min_assets: bundle.min_assets || 1,
          max_providers_per_asset: bundle.max_providers_per_asset || 3,
          total_setup_cost: bundle.total_setup_cost || 0,
          total_monthly_earnings_low: bundle.total_monthly_earnings_low || 0,
          total_monthly_earnings_high: bundle.total_monthly_earnings_high || 0,
          is_active: bundle.is_active || true,
          created_at: bundle.created_at,
          updated_at: bundle.updated_at
        };

        const matchingAssets = bundleConfig.asset_requirements.filter(asset => 
          selectedAssets.includes(asset)
        );

        // Only include if bundle requirements are met
        if (matchingAssets.length >= bundleConfig.min_assets) {
          // Get relevant providers for this bundle and transform them to ServiceProvider type
          const bundleProviders: ServiceProvider[] = serviceProviders
            .filter(provider => bundleConfig.asset_requirements.some(asset => provider.category === asset))
            .map(provider => ({
              id: provider.id,
              name: provider.name,
              category: provider.category,
              description: provider.description || '',
              logo_url: provider.logo_url,
              website_url: provider.website_url,
              affiliate_program_url: provider.affiliate_program_url || '',
              referral_link_template: provider.referral_link_template || '',
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
  };

  const selectBundle = async (bundleId: string, propertyAddress: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_bundle_selections')
        .insert({
          user_id: user.id,
          bundle_id: bundleId,
          property_address: propertyAddress,
          selected_assets: selectedAssets,
          selected_providers: [],
          status: 'pending'
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
