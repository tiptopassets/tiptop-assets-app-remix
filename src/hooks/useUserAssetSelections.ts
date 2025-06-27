
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserAssetSelections } from '@/services/userAssetService';
import { UserAssetSelection } from '@/types/userData';

export const useUserAssetSelections = () => {
  const { user } = useAuth();
  const [assetSelections, setAssetSelections] = useState<UserAssetSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSelections = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const selections = await loadUserAssetSelections(user.id);
      setAssetSelections(selections);
    } catch (err) {
      console.error('Error loading asset selections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load asset selections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSelections();
  }, [user?.id]);

  const isAssetConfigured = (assetType: string) => {
    return assetSelections.some(selection => 
      selection.asset_type.toLowerCase().includes(assetType.toLowerCase()) ||
      assetType.toLowerCase().includes(selection.asset_type.toLowerCase())
    );
  };

  return {
    assetSelections,
    loading,
    error,
    isAssetConfigured,
    refetch: loadSelections
  };
};
