
import { useCallback } from 'react';
import { generatePropertyAnalysis } from './propertyAnalysis';
import { generateAnalysis, syncAnalysisToDatabase } from './utils';
import { AnalysisResults } from './types';

export const useAnalysisHandlers = (
  user: any,
  refreshUserData: (() => Promise<void>) | undefined,
  saveAddress: ((address: string, coordinates?: any, formattedAddress?: string) => Promise<string | null>) | undefined,
  savePropertyAnalysis: ((addressId: string, analysisResults: AnalysisResults, coordinates?: any) => Promise<string | null>) | undefined,
  setIsGeneratingAnalysis: (value: boolean) => void,
  setIsAnalyzing: (value: boolean) => void,
  setAnalysisResults: (results: AnalysisResults | null) => void,
  setAnalysisComplete: (value: boolean) => void,
  setAnalysisError: (error: string | null) => void,
  addressCoordinates: google.maps.LatLngLiteral | null,
  useLocalAnalysis: boolean,
  toast: any
) => {
  const handleSyncAnalysisToDatabase = useCallback(async (
    address: string,
    analysis: any,
    coordinates?: any,
    satelliteImageUrl?: string
  ) => {
    return syncAnalysisToDatabase(
      user?.id,
      address,
      analysis,
      coordinates,
      satelliteImageUrl,
      refreshUserData
    );
  }, [user?.id, refreshUserData]);

  const handleGenerateAnalysis = useCallback(async (
    address: string,
    coords?: google.maps.LatLngLiteral,
    satelliteImageBase64?: string
  ) => {
    setIsGeneratingAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisResults(null);
    setAnalysisError(null);
    
    try {
      const analysis = await generateAnalysis(
        address,
        coords,
        satelliteImageBase64,
        user?.id,
        refreshUserData,
        toast
      );
      
      if (analysis) {
        setAnalysisResults(analysis);
        setAnalysisComplete(true);
      }
    } catch (error) {
      setAnalysisError(error.message || "Failed to analyze property");
      throw error;
    } finally {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
    }
  }, [user?.id, refreshUserData, toast, setIsGeneratingAnalysis, setIsAnalyzing, setAnalysisResults, setAnalysisComplete, setAnalysisError]);

  // Enhanced wrapper function with integrated database saving and comprehensive error handling
  const generatePropertyAnalysisWrapper = useCallback(async (propertyAddress: string) => {
    console.log('🏠 Starting property analysis with database integration:', { 
      propertyAddress, 
      userId: user?.id,
      hasSaveFunctions: !!(saveAddress && savePropertyAnalysis)
    });
    
    try {
      const analysis = await generatePropertyAnalysis({
        propertyAddress,
        addressCoordinates,
        useLocalAnalysis,
        setIsGeneratingAnalysis,
        setIsAnalyzing,
        setAnalysisResults,
        setAnalysisComplete,
        setUseLocalAnalysis: () => {}, // This will be handled by the main provider
        setAnalysisError,
        toast,
        // Pass database save functions with error handling
        saveAddress: user ? async (address, coordinates, formattedAddress) => {
          try {
            console.log('💾 Saving address to database:', { address, userId: user.id });
            const result = await saveAddress(address, coordinates, formattedAddress);
            console.log('✅ Address saved successfully:', result);
            return result;
          } catch (error) {
            console.error('❌ Failed to save address:', error);
            throw error;
          }
        } : null,
        savePropertyAnalysis: user ? async (addressId, analysisResults, coordinates) => {
          try {
            console.log('💾 Saving property analysis to database:', { addressId, userId: user.id });
            const result = await savePropertyAnalysis(addressId, analysisResults, coordinates);
            console.log('✅ Property analysis saved successfully:', result);
            return result;
          } catch (error) {
            console.error('❌ Failed to save property analysis:', error);
            throw error;
          }
        } : null,
        refreshUserData: user ? async () => {
          try {
            console.log('🔄 Refreshing user data after analysis save');
            await refreshUserData();
            console.log('✅ User data refreshed successfully');
          } catch (error) {
            console.error('❌ Failed to refresh user data:', error);
            throw error;
          }
        } : null,
        userId: user?.id
      });

      return analysis;
    } catch (error) {
      console.error('❌ Property analysis failed:', error);
      throw error;
    }
  }, [user?.id, addressCoordinates, useLocalAnalysis, saveAddress, savePropertyAnalysis, refreshUserData, toast]);

  return {
    handleSyncAnalysisToDatabase,
    handleGenerateAnalysis,
    generatePropertyAnalysisWrapper
  };
};
