
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadAssetSelections } from '@/services/sessionStorageService';
import { UserAssetSelection } from '@/types/userData';

export const useUserAssetSelections = (analysisId?: string) => {
  const { user } = useAuth();
  const [assetSelections, setAssetSelections] = useState<UserAssetSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const loadSelections = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('⏸️ [ASSET-SELECTIONS] Already fetching, skipping...');
      return;
    }
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('🔍 [ASSET-SELECTIONS] Loading asset selections for user:', user?.id || 'anonymous', 'analysisId:', analysisId);
      
      // Load selections for the authenticated user or current anonymous session, filtered by analysisId
      const userSelections = await loadAssetSelections(user?.id, analysisId);
      // Additionally, if authenticated, also include any lingering session selections for this browser session
      let sessionSelections: UserAssetSelection[] = [];
      const sessionId = localStorage.getItem('anonymous_session_id');
      if (user?.id && sessionId) {
        sessionSelections = await loadAssetSelections(undefined, analysisId);
      }

      const combinedSelections: UserAssetSelection[] = [
        ...userSelections,
        ...sessionSelections
      ].filter(Boolean) as UserAssetSelection[];

      // CRITICAL: Deduplicate by asset_type to prevent showing duplicate assets
      // Keep only the most recent selection for each asset type
      const uniqueSelectionsMap = new Map<string, UserAssetSelection>();
      combinedSelections.forEach(s => {
        if (!s || !s.asset_type) return;
        
        const normalizedType = s.asset_type.toLowerCase().trim();
        const existing = uniqueSelectionsMap.get(normalizedType);
        
        if (!existing) {
          uniqueSelectionsMap.set(normalizedType, s);
        } else {
          // Keep the more recent selection
          const existingDate = new Date(existing.selected_at || 0);
          const currentDate = new Date(s.selected_at || 0);
          if (currentDate > existingDate) {
            uniqueSelectionsMap.set(normalizedType, s);
          }
        }
      });
      const uniqueSelections = Array.from(uniqueSelectionsMap.values());

      // Filter by analysisId if provided to show only selections for this property
      let finalSelections = uniqueSelections;
      
      if (analysisId) {
        finalSelections = uniqueSelections.filter(s => s.analysis_id === analysisId);
        console.log('🎯 [ASSET-SELECTIONS] Filtered to analysis:', analysisId, 'Count:', finalSelections.length);
      } else {
        console.log('🎯 [ASSET-SELECTIONS] No analysisId filter - showing all selections');
      }
      
      console.log('🧠 [ASSET-SELECTIONS] Final selection logic:', {
        analysisIdProvided: !!analysisId,
        sessionIdPresent: !!sessionId,
        totalUserSelections: userSelections.length,
        totalSessionSelections: sessionSelections.length,
        combinedTotal: uniqueSelections.length,
        finalCount: finalSelections.length
      });
        
      setAssetSelections(finalSelections);
      
      console.log('✅ [ASSET-SELECTIONS] Loaded all asset selections:', {
        totalUserSelections: userSelections.length,
        totalSessionSelections: sessionSelections.length,
        combinedUnique: uniqueSelections.length,
        userId: user?.id,
        targetAnalysisId: analysisId,
        isAuthenticated: !!user,
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
      isFetchingRef.current = false;
    }
  }, [user?.id, analysisId]);

  // Auto-repair orphaned selections when loading
  const repairOrphanedSelections = async () => {
    try {
      console.log('🔧 [ASSET-SELECTIONS] Checking for orphaned selections to repair');
      const sessionId = localStorage.getItem('anonymous_session_id');
      const currentAnalysisId = localStorage.getItem('currentAnalysisId');
      
      // CRITICAL: Use provided analysisId parameter OR localStorage
      const analysisIdToUse = analysisId || currentAnalysisId;
      
      console.log('🔍 [ASSET-SELECTIONS] Repair context:', {
        hasUser: !!user?.id,
        hasSessionId: !!sessionId,
        providedAnalysisId: analysisId,
        currentAnalysisId,
        analysisIdToUse
      });
      
      // For authenticated users, repair any orphaned selections
      if (user?.id) {
        console.log('👤 [ASSET-SELECTIONS] Repairing for authenticated user:', user.id);
        
        // Strategy 1: Link session-based selections to user
        if (sessionId) {
          const { linkSessionToUser } = await import('@/services/sessionStorageService');
          const linkedCount = await linkSessionToUser(user.id);
          console.log('🔗 [ASSET-SELECTIONS] Linked session selections:', linkedCount);
        }
        
        // Strategy 2: Update selections with analysis ID (CRITICAL FIX)
        if (analysisIdToUse) {
          const { repairOrphanedUserSelections } = await import('@/services/sessionStorageService');
          const repairedCount = await repairOrphanedUserSelections(user.id, analysisIdToUse);
          console.log('🔧 [ASSET-SELECTIONS] Repaired user selections with analysis ID:', repairedCount);
        } else {
          // Strategy 3: Auto-recover analysis ID if needed
          const { getRecentAnalysisId } = await import('@/services/dataRecoveryService');
          const recoveredAnalysisId = await getRecentAnalysisId(user.id);
          if (recoveredAnalysisId) {
            localStorage.setItem('currentAnalysisId', recoveredAnalysisId);
            const { repairOrphanedUserSelections } = await import('@/services/sessionStorageService');
            const repairedCount = await repairOrphanedUserSelections(user.id, recoveredAnalysisId);
            console.log('🔄 [ASSET-SELECTIONS] Recovered and repaired with analysis ID:', recoveredAnalysisId, 'Count:', repairedCount);
          } else {
            console.warn('⚠️ [ASSET-SELECTIONS] No analysis ID available for repair');
          }
        }
        
        console.log('✅ [ASSET-SELECTIONS] Completed authenticated user repair');
      } else {
        // For anonymous users, just update with analysis ID if available
        if (sessionId && analysisIdToUse) {
          const { updateAssetSelectionsWithAnalysisId } = await import('@/services/sessionStorageService');
          const updatedCount = await updateAssetSelectionsWithAnalysisId(sessionId, analysisIdToUse);
          console.log('✅ [ASSET-SELECTIONS] Updated anonymous selections with analysis ID:', updatedCount);
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
  }, [user?.id, analysisId, loadSelections]); // loadSelections is now stable via useCallback

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
