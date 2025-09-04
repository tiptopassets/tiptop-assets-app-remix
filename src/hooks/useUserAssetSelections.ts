
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
      
      console.log('🔍 [ASSET-SELECTIONS] Loading asset selections for user:', user?.id || 'anonymous', 'analysisId:', analysisId);
      const selections = await loadAssetSelections(user?.id);
      
      // Filter by analysis ID if provided - this is critical for multi-property support
      const filteredSelections = analysisId 
        ? selections.filter(selection => {
            const matches = selection.analysis_id === analysisId;
            console.log('🎯 [ASSET-SELECTIONS] Selection filter check:', {
              selectionId: selection.id,
              selectionAnalysisId: selection.analysis_id,
              targetAnalysisId: analysisId,
              matches,
              assetType: selection.asset_type
            });
            return matches;
          })
        : selections;
        
      setAssetSelections(filteredSelections);
      
      console.log('✅ [ASSET-SELECTIONS] Loaded filtered asset selections:', {
        totalSelections: selections.length,
        filteredCount: filteredSelections.length,
        userId: user?.id,
        targetAnalysisId: analysisId,
        isAuthenticated: !!user,
        filteredSelections: filteredSelections.map(s => ({
          id: s.id,
          asset_type: s.asset_type,
          monthly_revenue: s.monthly_revenue,
          analysis_id: s.analysis_id
        }))
      });
    } catch (err) {
      console.error('❌ [ASSET-SELECTIONS] Error loading asset selections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load asset selections');
    } finally {
      setLoading(false);
    }
  };

  // Auto-repair orphaned selections when loading
  const repairOrphanedSelections = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔧 [ASSET-SELECTIONS] Checking for orphaned selections to repair');
      const sessionId = localStorage.getItem('anonymous_session_id');
      const currentAnalysisId = localStorage.getItem('currentAnalysisId');
      
      if (sessionId && currentAnalysisId) {
        // Update selections with analysis ID
        const { updateAssetSelectionsWithAnalysisId } = await import('@/services/sessionStorageService');
        await updateAssetSelectionsWithAnalysisId(sessionId, currentAnalysisId);
        
        // Link session to user
        const { linkSessionToUser } = await import('@/services/sessionStorageService');
        await linkSessionToUser(user.id);
        
        console.log('✅ [ASSET-SELECTIONS] Repaired orphaned selections via session');
      } else if (currentAnalysisId) {
        // For authenticated users, update their null analysis_id selections
        const { updateUserAssetSelectionsWithAnalysisId } = await import('@/services/sessionStorageService');
        await updateUserAssetSelectionsWithAnalysisId(user.id, currentAnalysisId);
        
        console.log('✅ [ASSET-SELECTIONS] Repaired orphaned selections for authenticated user');
      }
    } catch (error) {
      console.warn('⚠️ [ASSET-SELECTIONS] Could not repair orphaned selections:', error);
    }
  };

  useEffect(() => {
    const doLoad = async () => {
      // First attempt to repair any orphaned selections
      await repairOrphanedSelections();
      
      // Then load selections normally
      if (user?.id || analysisId) {
        loadSelections();
      }
    };
    
    doLoad();
  }, [user?.id, analysisId]); // Trigger reload when user or analysisId changes

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
