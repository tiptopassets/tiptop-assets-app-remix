
import React from 'react';
import { motion } from 'framer-motion';
import { useBundleRecommendations } from '@/hooks/useBundleRecommendations';
import BundleRecommendationCard from './BundleRecommendationCard';
import { Loader2, Package } from 'lucide-react';

interface BundleRecommendationsProps {
  detectedAssets: string[];
  onSelectBundle: (recommendation: any) => void;
}

const BundleRecommendations: React.FC<BundleRecommendationsProps> = ({
  detectedAssets,
  onSelectBundle
}) => {
  const { recommendations, loading, error } = useBundleRecommendations();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-tiptop-purple" />
        <span className="ml-2 text-white">Finding the best bundles for you...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load bundle recommendations</p>
        <p className="text-gray-400 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-white">No bundles found for your assets</p>
        <p className="text-gray-400 text-sm">Try adding more assets to unlock bundle opportunities</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Recommended Bundles
        </h2>
        <p className="text-gray-300">
          Maximize your earnings with these curated service combinations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation, index) => {
          // Transform the recommendation to match the expected format
          const transformedRecommendation = {
            bundle: {
              id: recommendation.id,
              name: recommendation.name,
              description: recommendation.description
            },
            providers: recommendation.providers,
            totalEarnings: {
              low: recommendation.monthlyEarningsLow,
              high: recommendation.monthlyEarningsHigh
            },
            matchingAssets: recommendation.assets,
            setupCost: recommendation.totalSetupCost
          };

          return (
            <BundleRecommendationCard
              key={recommendation.id}
              recommendation={transformedRecommendation}
              onSelectBundle={onSelectBundle}
              index={index}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default BundleRecommendations;
