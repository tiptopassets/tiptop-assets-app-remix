
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
        
      const finalSelections = analysisId && filteredSelections.length === 0 
        ? selections 
        : filteredSelections;
        
      setAssetSelections(finalSelections);
      
      console.log('✅ [ASSET-SELECTIONS] Loaded filtered asset selections:', {
        totalSelections: selections.length,
        filteredCount: filteredSelections.length,
        usedFallbackAllAnalyses: analysisId ? filteredSelections.length === 0 : false,
        userId: user?.id,
        targetAnalysisId: analysisId,
        isAuthenticated: !!user,
        filteredSelections: filteredSelections.map(s => ({
          id: s.id,
          asset_type: s.asset_type,
          monthly_revenue: s.monthly_revenue,
          analysis_id: s.analysis_id
        })),
        finalSelections: finalSelections.map(s => ({
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
    try {
      console.log('🔧 [ASSET-SELECTIONS] Checking for orphaned selections to repair');
      const sessionId = localStorage.getItem('anonymous_session_id');
      const currentAnalysisId = localStorage.getItem('currentAnalysisId');
      
      // For authenticated users, repair any orphaned selections
      if (user?.id) {
        console.log('👤 [ASSET-SELECTIONS] Repairing for authenticated user:', user.id);
        
        // Strategy 1: Link session-based selections to user
        if (sessionId) {
          const { linkSessionToUser } = await import('@/services/sessionStorageService');
          const linkedCount = await linkSessionToUser(user.id);
          console.log('🔗 [ASSET-SELECTIONS] Linked session selections:', linkedCount);
        }
        
        // Strategy 2: Update selections with analysis ID
        if (currentAnalysisId) {
          const { repairOrphanedUserSelections } = await import('@/services/sessionStorageService');
          const repairedCount = await repairOrphanedUserSelections(user.id, currentAnalysisId);
          console.log('🔧 [ASSET-SELECTIONS] Repaired user selections:', repairedCount);
        }
        
        // Strategy 3: Auto-recover analysis ID if needed
        if (!currentAnalysisId) {
          const { getRecentAnalysisId } = await import('@/services/dataRecoveryService');
          const recoveredAnalysisId = await getRecentAnalysisId(user.id);
          if (recoveredAnalysisId) {
            localStorage.setItem('currentAnalysisId', recoveredAnalysisId);
            console.log('🔄 [ASSET-SELECTIONS] Recovered analysis ID:', recoveredAnalysisId);
          }
        }
        
        console.log('✅ [ASSET-SELECTIONS] Completed authenticated user repair');
      } else {
        // For anonymous users, just update with analysis ID if available
        if (sessionId && currentAnalysisId) {
          const { updateAssetSelectionsWithAnalysisId } = await import('@/services/sessionStorageService');
          await updateAssetSelectionsWithAnalysisId(sessionId, currentAnalysisId);
          console.log('✅ [ASSET-SELECTIONS] Updated anonymous selections with analysis ID');
        }
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
