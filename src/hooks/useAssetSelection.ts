import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveAssetSelection, loadUserAssetSelections } from '@/services/userAssetService';
import { saveAssetSelectionAnonymous, loadAssetSelections } from '@/services/sessionStorageService';
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
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Starting asset selection save process:', {
        assetType,
        monthlyRevenue,
        providedAnalysisId: analysisId,
        userId: user?.id,
        isAnonymous: !user
      });

      // Use session-based storage for anonymous users or authenticated users
      const selectionId = await saveAssetSelectionAnonymous(
        assetType,
        assetData,
        monthlyRevenue,
        setupCost,
        roiMonths,
        analysisId,
        user?.id
      );

      if (selectionId) {
        const successMessage = user 
          ? `Successfully saved ${assetType} selection with $${monthlyRevenue}/month potential.`
          : `${assetType} selection saved. Sign in later to access your saved selections.`;
          
        toast({
          title: "Asset Selection Saved",
          description: successMessage,
        });
        
        console.log('✅ Asset selection saved successfully:', {
          selectionId,
          assetType,
          analysisId,
          monthlyRevenue,
          isAnonymous: !user
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
    setLoading(true);
    setError(null);

    try {
      // Load selections for both authenticated and anonymous users
      const selections = await loadAssetSelections(user?.id);
      console.log('✅ Loaded asset selections:', selections.length, user ? 'for user' : 'for session');
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