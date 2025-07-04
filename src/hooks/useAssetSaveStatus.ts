import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';
import { saveAssetSelection } from '@/services/userAssetService';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import { SelectedAsset } from '@/types/analysis';

export const useAssetSaveStatus = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { currentAnalysisId, currentAddressId } = useGoogleMap();
  const { toast } = useToast();
  const { trackOption } = useJourneyTracking();

  const saveSelectedAssets = useCallback(async (selectedAssetsData: SelectedAsset[]) => {
    console.log('🚀 Starting asset save process...');
    setIsSaving(true);

    try {
      // Get analysis ID from context or localStorage as fallback
      let analysisId = currentAnalysisId || localStorage.getItem('currentAnalysisId');
      
      console.log('🔍 Asset save debug:', {
        userExists: !!user,
        userId: user?.id,
        selectedAssetsCount: selectedAssetsData.length,
        contextAnalysisId: currentAnalysisId,
        storageAnalysisId: localStorage.getItem('currentAnalysisId'),
        finalAnalysisId: analysisId
      });

      // Validate required data
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (selectedAssetsData.length === 0) {
        throw new Error('No assets selected');
      }

      // If no analysis ID, try to find the latest one
      if (!analysisId) {
        console.log('🔍 No analysis ID found, looking up latest analysis...');
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: latestAnalysis, error } = await supabase
          .from('user_property_analyses')
          .select('id, address_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !latestAnalysis) {
          throw new Error('No property analysis found. Please analyze your property first.');
        }

        analysisId = latestAnalysis.id;
        console.log('✅ Found latest analysis:', analysisId);
        localStorage.setItem('currentAnalysisId', analysisId);
      }

      // Save each selected asset
      const savePromises = selectedAssetsData.map(async (asset, index) => {
        console.log(`💾 Saving asset ${index + 1}/${selectedAssetsData.length}:`, asset.title);
        
        return await saveAssetSelection(
          user.id,
          analysisId,
          asset.title,
          asset.formData || {},
          asset.monthlyRevenue,
          asset.setupCost || 0,
          asset.roi
        );
      });

      const results = await Promise.all(savePromises);
      const successfulSaves = results.filter(r => r !== null).length;

      if (successfulSaves === selectedAssetsData.length) {
        console.log('✅ All assets saved successfully');
        
        // Track the option selection
        await trackOption('manual');
        
        toast({
          title: "Assets Saved Successfully",
          description: `${selectedAssetsData.length} asset selection${selectedAssetsData.length > 1 ? 's' : ''} saved to your dashboard`,
        });

        return true;
      } else {
        console.warn('⚠️ Some saves failed');
        toast({
          title: "Partial Save",
          description: `${successfulSaves} of ${selectedAssetsData.length} assets saved successfully`,
          variant: "destructive"
        });
        return false;
      }

    } catch (error) {
      console.error('❌ Failed to save asset selections:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Save Failed",
        description: `Failed to save asset selections: ${errorMessage}`,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, currentAnalysisId, currentAddressId, toast, trackOption]);

  return {
    saveSelectedAssets,
    isSaving
  };
};