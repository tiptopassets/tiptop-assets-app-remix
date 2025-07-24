
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadAssetSelections } from '@/services/sessionStorageService';
import { UserAssetSelection } from '@/types/userData';

interface UseUserAssetSelectionsProps {
  analysisId?: string;
}

export const useUserAssetSelections = (options?: UseUserAssetSelectionsProps) => {
  const { user } = useAuth();
  const [assetSelections, setAssetSelections] = useState<UserAssetSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSelections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading asset selections for user:', {
        userId: user?.id || 'anonymous',
        analysisId: options?.analysisId
      });
      
      const selections = await loadAssetSelections(user?.id, options?.analysisId);
      setAssetSelections(selections);
      
      console.log('✅ Loaded asset selections for dashboard:', {
        count: selections.length,
        userId: user?.id,
        analysisId: options?.analysisId,
        isAuthenticated: !!user,
        selections: selections.map(s => ({
          id: s.id,
          asset_type: s.asset_type,
          monthly_revenue: s.monthly_revenue,
          user_id: s.user_id,
          analysis_id: s.analysis_id,
          session_id: s.session_id
        }))
      });
    } catch (err) {
      console.error('Error loading asset selections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load asset selections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSelections();
  }, [user?.id, options?.analysisId]); // Reload when user or analysis ID changes

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
