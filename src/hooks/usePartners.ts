import { useState, useEffect, useCallback } from 'react';
import { 
  fetchPartners, 
  getPartnersForAssetType, 
  getPartnerById, 
  getAvailableAssetCategories,
  type Partner,
  type PartnerInfo 
} from '@/services/partnersRegistry';

export interface UsePartnersReturn {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getPartnersByAssetType: (assetType: string) => PartnerInfo[];
  getPartner: (partnerId: string) => PartnerInfo | null;
  getAssetCategories: () => string[];
}

/**
 * Custom hook for managing partners data across the application
 */
export function usePartners(): UsePartnersReturn {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const partnersData = await fetchPartners(forceRefresh);
      setPartners(partnersData);
    } catch (err) {
      console.error('Error loading partners:', err);
      setError(err instanceof Error ? err.message : 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const getPartnersByAssetType = useCallback((assetType: string): PartnerInfo[] => {
    return getPartnersForAssetType(assetType, partners);
  }, [partners]);

  const getPartner = useCallback((partnerId: string): PartnerInfo | null => {
    return getPartnerById(partnerId, partners);
  }, [partners]);

  const getAssetCategories = useCallback((): string[] => {
    return getAvailableAssetCategories(partners);
  }, [partners]);

  const refetch = useCallback(async () => {
    await loadPartners(true);
  }, [loadPartners]);

  return {
    partners,
    loading,
    error,
    refetch,
    getPartnersByAssetType,
    getPartner,
    getAssetCategories,
  };
}

/**
 * Hook specifically for getting partners for a single asset type
 */
export function usePartnersForAsset(assetType: string) {
  const { partners, loading, error, refetch } = usePartners();
  const [assetPartners, setAssetPartners] = useState<PartnerInfo[]>([]);

  useEffect(() => {
    if (partners.length > 0 && assetType) {
      const matchingPartners = getPartnersForAssetType(assetType, partners);
      setAssetPartners(matchingPartners);
    }
  }, [partners, assetType]);

  return {
    partners: assetPartners,
    loading,
    error,
    refetch,
  };
}