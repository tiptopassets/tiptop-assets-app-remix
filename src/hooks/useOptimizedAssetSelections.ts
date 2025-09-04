import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserAssetSelection } from '@/types/userData';
import { useEffect } from 'react';

interface OptimizedAssetSelection {
  id: string;
  asset_type: string;
  monthly_revenue: number;
  setup_cost: number;
  roi_months?: number;
  selected_at: string;
  analysis_id?: string;
}

// Lightweight query - only essential columns for fast loading
const fetchAssetSelectionsOptimized = async (userId?: string): Promise<OptimizedAssetSelection[]> => {
  try {
    const sessionId = !userId ? localStorage.getItem('anonymous_session_id') : null;
    
    let query = supabase
      .from('user_asset_selections')
      .select('id, asset_type, monthly_revenue, setup_cost, roi_months, selected_at, analysis_id');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId).is('user_id', null);
    } else {
      return [];
    }
    
    const { data, error } = await query.order('selected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error loading optimized asset selections:', err);
    return [];
  }
};

// Background repair function - runs after initial data load
const runBackgroundRepair = async (userId?: string) => {
  try {
    console.log('🔧 [BACKGROUND-REPAIR] Starting background data repair');
    const sessionId = localStorage.getItem('anonymous_session_id');
    const currentAnalysisId = localStorage.getItem('currentAnalysisId');
    
    if (userId) {
      // Import repair functions dynamically to avoid blocking initial load
      const { linkSessionToUser, repairOrphanedUserSelections } = await import('@/services/sessionStorageService');
      const { getRecentAnalysisId } = await import('@/services/dataRecoveryService');
      
      // Strategy 1: Link session-based selections to user
      if (sessionId) {
        await linkSessionToUser(userId);
      }
      
      // Strategy 2: Update selections with analysis ID
      if (currentAnalysisId) {
        await repairOrphanedUserSelections(userId, currentAnalysisId);
      }
      
      // Strategy 3: Auto-recover analysis ID if needed
      if (!currentAnalysisId) {
        const recoveredAnalysisId = await getRecentAnalysisId(userId);
        if (recoveredAnalysisId) {
          localStorage.setItem('currentAnalysisId', recoveredAnalysisId);
        }
      }
    } else {
      // For anonymous users, just update with analysis ID if available
      if (sessionId && currentAnalysisId) {
        const { updateAssetSelectionsWithAnalysisId } = await import('@/services/sessionStorageService');
        await updateAssetSelectionsWithAnalysisId(sessionId, currentAnalysisId);
      }
    }
    
    console.log('✅ [BACKGROUND-REPAIR] Background repair completed');
  } catch (error) {
    console.warn('⚠️ [BACKGROUND-REPAIR] Background repair failed:', error);
  }
};

export const useOptimizedAssetSelections = (analysisId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Main query with caching
  const { data: assetSelections = [], isLoading, error } = useQuery({
    queryKey: ['asset-selections', user?.id, analysisId],
    queryFn: () => fetchAssetSelectionsOptimized(user?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!(user?.id || localStorage.getItem('anonymous_session_id')),
  });

  // Filter by analysis ID after data is loaded
  const filteredSelections = analysisId 
    ? assetSelections.filter(selection => selection.analysis_id === analysisId)
    : assetSelections;

  // Use fallback to all selections if no matches found for specific analysis
  const finalSelections = analysisId && filteredSelections.length === 0 
    ? assetSelections 
    : filteredSelections;

  // Background repair - runs after initial data load
  useEffect(() => {
    if (!isLoading && (user?.id || localStorage.getItem('anonymous_session_id'))) {
      // Run repair in background without blocking UI
      setTimeout(() => {
        runBackgroundRepair(user?.id).then(() => {
          // Invalidate query to refetch updated data
          queryClient.invalidateQueries({ queryKey: ['asset-selections', user?.id] });
        });
      }, 100);
    }
  }, [user?.id, isLoading, queryClient]);

  const isAssetConfigured = (assetType: string) => {
    return finalSelections.some(selection => 
      selection.asset_type.toLowerCase().includes(assetType.toLowerCase()) ||
      assetType.toLowerCase().includes(selection.asset_type.toLowerCase())
    );
  };

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: ['asset-selections', user?.id] });
  };

  return {
    assetSelections: finalSelections,
    loading: isLoading,
    error: error?.message || null,
    isAssetConfigured,
    refetch
  };
};