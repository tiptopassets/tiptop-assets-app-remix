
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadAssetSelections } from '@/services/sessionStorageService';
import { UserAssetSelection } from '@/types/userData';

export const useUserAssetSelections = (analysisId?: string) => {
  const { user } = useAuth();
  const [assetSelections, setAssetSelections] = useState<UserAssetSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSelections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading asset selections for user:', user?.id || 'anonymous', 'analysisId:', analysisId);
      const selections = await loadAssetSelections(user?.id);
      
      // Filter by analysis ID if provided
      const filteredSelections = analysisId 
        ? selections.filter(selection => selection.analysis_id === analysisId)
        : selections;
        
      setAssetSelections(filteredSelections);
      
      console.log('✅ Loaded asset selections for dashboard:', {
        count: filteredSelections.length,
        userId: user?.id,
        analysisId,
        isAuthenticated: !!user,
        selections: filteredSelections.map(s => ({
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
  }, [user?.id, analysisId]); // Will load for both authenticated and anonymous users

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
