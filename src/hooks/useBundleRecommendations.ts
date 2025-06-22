
import { useState, useEffect } from 'react';
import { BundleRecommendation, BundleConfiguration, ServiceProvider } from '@/contexts/ServiceProviders/types';

export const useBundleRecommendations = (detectedAssets: string[]) => {
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Since the database tables don't exist, we'll use mock data
        const mockBundles: BundleConfiguration[] = [
          {
            id: '1',
            name: 'Solar & Storage Bundle',
            description: 'Maximize your renewable energy earnings',
            asset_requirements: ['solar', 'storage'],
            min_assets: 2,
            max_providers_per_asset: 3,
            total_setup_cost: 15000,
            total_monthly_earnings_low: 200,
            total_monthly_earnings_high: 500,
            is_active: true
          },
          {
            id: '2',
            name: 'Smart Home Bundle',
            description: 'Complete smart home monetization',
            asset_requirements: ['wifi', 'ev_charger'],
            min_assets: 2,
            max_providers_per_asset: 2,
            total_setup_cost: 5000,
            total_monthly_earnings_low: 100,
            total_monthly_earnings_high: 300,
            is_active: true
          }
        ];

        const mockProviders: ServiceProvider[] = [
          {
            id: '1',
            name: 'SolarProvider',
            category: 'solar',
            description: 'Solar panel provider',
            commission_rate: 0.05,
            setup_cost: 10000,
            avg_monthly_earnings_low: 150,
            avg_monthly_earnings_high: 300,
            conversion_rate: 0.15,
            priority: 1,
            is_active: true
          },
          {
            id: '2',
            name: 'StorageProvider',
            category: 'storage',
            description: 'Battery storage provider',
            commission_rate: 0.04,
            setup_cost: 5000,
            avg_monthly_earnings_low: 50,
            avg_monthly_earnings_high: 200,
            conversion_rate: 0.12,
            priority: 2,
            is_active: true
          }
        ];

        // Filter bundles based on detected assets
        const filteredBundles = mockBundles.filter(bundle => {
          const matchingAssets = bundle.asset_requirements.filter(asset => 
            detectedAssets.includes(asset)
          );
          return matchingAssets.length >= bundle.min_assets;
        });

        // Create recommendations
        const bundleRecommendations: BundleRecommendation[] = filteredBundles.map(bundle => {
          const relevantProviders = mockProviders.filter(provider => 
            bundle.asset_requirements.includes(provider.category)
          );

          const matchingAssets = bundle.asset_requirements.filter(asset => 
            detectedAssets.includes(asset)
          );

          return {
            bundle,
            providers: relevantProviders,
            totalEarnings: {
              low: bundle.total_monthly_earnings_low,
              high: bundle.total_monthly_earnings_high
            },
            matchingAssets,
            setupCost: bundle.total_setup_cost
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
