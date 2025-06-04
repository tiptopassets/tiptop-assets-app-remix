
import { useMemo } from 'react';
import { AdditionalOpportunity } from '@/types/analysis';
import { additionalOpportunities, getOpportunitiesByRevenueTier, getOpportunitiesByCategory } from '@/data/additionalOpportunities';

export function useAdditionalOpportunities() {
  const opportunitiesByTier = useMemo(() => getOpportunitiesByRevenueTier(), []);
  const opportunitiesByCategory = useMemo(() => getOpportunitiesByCategory(), []);

  return { 
    additionalOpportunities,
    opportunitiesByTier,
    opportunitiesByCategory
  };
}
