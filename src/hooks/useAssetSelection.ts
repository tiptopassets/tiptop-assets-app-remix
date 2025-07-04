import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveAssetSelection, loadUserAssetSelections } from '@/services/userAssetService';
import { getRecentAnalysisId } from '@/services/dataRecoveryService';
import { useToast } from '@/hooks/use-toast';

export const useAssetSelection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSelection = useCallback(async (
    assetType: string,
    assetData: any,
    monthlyRevenue: number,
    setupCost: number = 0,
    roiMonths?: number,
    analysisId?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save asset selections.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Starting asset selection save process:', {
        assetType,
        monthlyRevenue,
        providedAnalysisId: analysisId,
        userId: user.id
      });

      // Get analysis ID - use provided one or find the most recent
      let finalAnalysisId = analysisId;
      if (!finalAnalysisId) {
        console.log('🔍 No analysis ID provided, finding recent one...');
        finalAnalysisId = await getRecentAnalysisId(user.id);
        
        if (!finalAnalysisId) {
          throw new Error('No analysis found. Please complete a property analysis first.');
        }
        console.log('✅ Found recent analysis ID:', finalAnalysisId);
      }

      // Save the asset selection
      const selectionId = await saveAssetSelection(
        user.id,
        finalAnalysisId,
        assetType,
        assetData,
        monthlyRevenue,
        setupCost,
        roiMonths
      );

      if (selectionId) {
        toast({
          title: "Asset Selection Saved",
          description: `Successfully saved ${assetType} selection with $${monthlyRevenue}/month potential.`,
        });
        
        console.log('✅ Asset selection saved successfully:', {
          selectionId,
          assetType,
          analysisId: finalAnalysisId,
          monthlyRevenue
        });
        
        return selectionId;
      } else {
        throw new Error('Failed to save asset selection');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save asset selection';
      setError(errorMessage);
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      console.error('❌ Asset selection save failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const loadSelections = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const selections = await loadUserAssetSelections(user.id);
      console.log('✅ Loaded asset selections:', selections.length);
      return selections;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load asset selections';
      setError(errorMessage);
      console.error('❌ Failed to load asset selections:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    saveSelection,
    loadSelections,
    loading,
    error,
    clearError: () => setError(null)
  };
};