
import { useState } from 'react';

export const useBundleRecommendations = (selectedAssets: string[] = []) => {
  const [recommendations] = useState([]);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const selectBundle = async (bundleId: string, propertyAddress: string) => {
    console.log('Bundle selection is temporarily disabled');
    return null;
  };

  const refetch = async () => {
    console.log('Bundle recommendations are temporarily disabled');
  };

  return {
    recommendations,
    isLoading,
    error,
    selectBundle,
    refetch
  };
};
