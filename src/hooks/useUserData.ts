
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AnalysisResults } from '@/contexts/GoogleMapContext/types';
import { 
  UserAddress, 
  UserPropertyAnalysis, 
  UserAssetSelection, 
  UserDashboardPreferences 
} from '@/types/userData';
import { saveAddress, loadUserAddresses } from '@/services/userAddressService';
import { savePropertyAnalysis, loadUserAnalyses } from '@/services/userAnalysisService';
import { saveAssetSelection, loadUserAssetSelections } from '@/services/userAssetService';
import { loadUserPreferences } from '@/services/userPreferencesService';
import { recoverAnalysesToDatabase, hasUnauthenticatedAnalyses } from '@/services/unauthenticatedAnalysisService';

export const useUserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [analyses, setAnalyses] = useState<UserPropertyAnalysis[]>([]);
  const [assetSelections, setAssetSelections] = useState<UserAssetSelection[]>([]);
  const [dashboardPreferences, setDashboardPreferences] = useState<UserDashboardPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save address to database
  const handleSaveAddress = async (address: string, coordinates?: any, formattedAddress?: string): Promise<string | null> => {
    if (!user) {
      console.warn('❌ [USER DATA] Cannot save address: User not authenticated');
      return null;
    }

    try {
      console.log('💾 [USER DATA] Saving address:', address);
      const addressId = await saveAddress(user.id, address, coordinates, formattedAddress, addresses.length === 0);
      
      // Reload addresses to get the updated data
      await refreshUserData();
      
      return addressId;
    } catch (err) {
      console.error('❌ [USER DATA] Error saving address:', err);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
      return null;
    }
  };

  // Save property analysis to database
  const handleSavePropertyAnalysis = async (
    addressId: string, 
    analysisResults: AnalysisResults,
    coordinates?: any
  ): Promise<string | null> => {
    if (!user) {
      console.warn('❌ [USER DATA] Cannot save analysis: User not authenticated');
      return null;
    }

    try {
      console.log('💾 [USER DATA] Saving property analysis for address:', addressId);
      const analysisId = await savePropertyAnalysis(user.id, addressId, analysisResults, coordinates);
      
      // Reload all data to get the updated analysis
      await refreshUserData();
      
      return analysisId;
    } catch (err) {
      console.error('❌ [USER DATA] Error saving property analysis:', err);
      toast({
        title: "Error",
        description: "Failed to save property analysis",
        variant: "destructive"
      });
      return null;
    }
  };

  // Save asset selection to database
  const handleSaveAssetSelection = async (
    analysisId: string,
    assetType: string,
    assetData: any,
    monthlyRevenue: number,
    setupCost: number = 0,
    roiMonths?: number
  ): Promise<string | null> => {
    if (!user) {
      console.warn('❌ [USER DATA] Cannot save asset selection: User not authenticated');
      return null;
    }

    try {
      console.log('💾 [USER DATA] Saving asset selection:', assetType);
      const selectionId = await saveAssetSelection(
        user.id, 
        analysisId, 
        assetType, 
        assetData, 
        monthlyRevenue, 
        setupCost, 
        roiMonths
      );
      
      // Reload asset selections to get the updated data
      await refreshUserData();
      
      return selectionId;
    } catch (err) {
      console.error('❌ [USER DATA] Error saving asset selection:', err);
      toast({
        title: "Error",
        description: "Failed to save asset selection",
        variant: "destructive"
      });
      return null;
    }
  };

  // Enhanced recovery function with detailed logging
  const attemptAnalysisRecovery = async (): Promise<void> => {
    if (!user || !hasUnauthenticatedAnalyses()) {
      return;
    }

    console.log('🔄 [USER DATA] Attempting to recover unauthenticated analyses...');
    
    try {
      const result = await recoverAnalysesToDatabase(user.id);
      
      if (result.recovered > 0) {
        console.log(`✅ [USER DATA] Successfully recovered ${result.recovered} analyses`);
        toast({
          title: "Analysis Recovery",
          description: `Successfully recovered ${result.recovered} property analysis${result.recovered > 1 ? 'es' : ''} from your previous session`,
        });
        
        // Refresh data to show recovered analyses
        await refreshUserData();
      }
      
      if (result.failed > 0) {
        console.warn(`⚠️ [USER DATA] Failed to recover ${result.failed} analyses:`, result.errors);
        toast({
          title: "Partial Recovery",
          description: `Recovered ${result.recovered} analyses, but ${result.failed} failed to recover`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ [USER DATA] Recovery process failed:', error);
      toast({
        title: "Recovery Failed",
        description: "Could not recover your previous analysis data",
        variant: "destructive"
      });
    }
  };

  // Refresh user data function for external use
  const refreshUserData = async () => {
    if (!user) {
      console.warn('❌ [USER DATA] Cannot refresh data: User not authenticated');
      return;
    }

    console.log('🔄 [USER DATA] Refreshing user data for:', user.id);
    try {
      const [addressData, analysisData, assetData, prefData] = await Promise.all([
        loadUserAddresses(user.id),
        loadUserAnalyses(user.id),
        loadUserAssetSelections(user.id),
        loadUserPreferences(user.id)
      ]);

      console.log('✅ [USER DATA] Refreshed user data:', {
        addresses: addressData.length,
        analyses: analysisData.length,
        assetSelections: assetData.length,
        preferences: !!prefData
      });

      setAddresses(addressData);
      setAnalyses(analysisData);
      setAssetSelections(assetData);
      setDashboardPreferences(prefData);

    } catch (err) {
      console.error('❌ [USER DATA] Error refreshing user data:', err);
      throw err;
    }
  };

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) {
      console.warn('❌ [USER DATA] Cannot load data: User not authenticated');
      setLoading(false);
      return;
    }

    console.log('🔄 [USER DATA] Loading user data for:', user.id);
    setLoading(true);
    setError(null);

    try {
      await refreshUserData();
      
      // Attempt recovery after initial load
      await attemptAnalysisRecovery();
      
    } catch (err) {
      console.error('❌ [USER DATA] Error loading user data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Auto-refresh when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setAddresses([]);
      setAnalyses([]);
      setAssetSelections([]);
      setDashboardPreferences(null);
      setError(null);
    }
  }, [user, loadUserData]);

  // Get primary address
  const getPrimaryAddress = (): UserAddress | null => {
    return addresses.find(addr => addr.is_primary) || addresses[0] || null;
  };

  // Get latest analysis
  const getLatestAnalysis = (): UserPropertyAnalysis | null => {
    return analyses[0] || null;
  };

  return {
    addresses,
    analyses,
    assetSelections,
    dashboardPreferences,
    loading,
    error,
    saveAddress: handleSaveAddress,
    savePropertyAnalysis: handleSavePropertyAnalysis,
    saveAssetSelection: handleSaveAssetSelection,
    loadUserData,
    refreshUserData,
    getPrimaryAddress,
    getLatestAnalysis
  };
};
