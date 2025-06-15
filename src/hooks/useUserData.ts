
import { useState, useEffect } from 'react';
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
    if (!user) return null;

    try {
      const addressId = await saveAddress(user.id, address, coordinates, formattedAddress, addresses.length === 0);
      
      // Reload addresses to get the updated data
      const updatedAddresses = await loadUserAddresses(user.id);
      setAddresses(updatedAddresses);
      
      return addressId;
    } catch (err) {
      console.error('Error saving address:', err);
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
    if (!user) return null;

    try {
      const analysisId = await savePropertyAnalysis(user.id, addressId, analysisResults, coordinates);
      
      // Reload analyses to get the updated data
      const updatedAnalyses = await loadUserAnalyses(user.id);
      setAnalyses(updatedAnalyses);
      
      return analysisId;
    } catch (err) {
      console.error('Error saving property analysis:', err);
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
    if (!user) return null;

    try {
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
      const updatedSelections = await loadUserAssetSelections(user.id);
      setAssetSelections(updatedSelections);
      
      return selectionId;
    } catch (err) {
      console.error('Error saving asset selection:', err);
      toast({
        title: "Error",
        description: "Failed to save asset selection",
        variant: "destructive"
      });
      return null;
    }
  };

  // Load user data
  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [addressData, analysisData, assetData, prefData] = await Promise.all([
        loadUserAddresses(user.id),
        loadUserAnalyses(user.id),
        loadUserAssetSelections(user.id),
        loadUserPreferences(user.id)
      ]);

      setAddresses(addressData);
      setAnalyses(analysisData);
      setAssetSelections(assetData);
      setDashboardPreferences(prefData);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get primary address
  const getPrimaryAddress = (): UserAddress | null => {
    return addresses.find(addr => addr.is_primary) || addresses[0] || null;
  };

  // Get latest analysis
  const getLatestAnalysis = (): UserPropertyAnalysis | null => {
    return analyses[0] || null;
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setAddresses([]);
      setAnalyses([]);
      setAssetSelections([]);
      setDashboardPreferences(null);
    }
  }, [user]);

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
    getPrimaryAddress,
    getLatestAnalysis
  };
};
