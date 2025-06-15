
import { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleMapContextType, AnalysisResults } from './types';
import { generatePropertyAnalysis } from './propertyAnalysis';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const GoogleMapContext = createContext<GoogleMapContextType | undefined>(undefined);

export const GoogleMapProvider = ({ children }: { children: ReactNode }) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [address, setAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [addressCoordinates, setAddressCoordinates] = useState<google.maps.LatLngLiteral | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [useLocalAnalysis, setUseLocalAnalysis] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(20);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const handlePropertyAnalysis = async (propertyAddress: string) => {
    await generatePropertyAnalysis({
      propertyAddress,
      addressCoordinates,
      useLocalAnalysis,
      setIsGeneratingAnalysis,
      setIsAnalyzing,
      setAnalysisResults: async (results: AnalysisResults | null) => {
        setAnalysisResults(results);
        
        // Sync to database if user is logged in and we have results
        if (results && propertyAddress && user && !authLoading) {
          try {
            // Import the sync functions
            const { saveAddress } = await import('@/services/userAddressService');
            const { savePropertyAnalysis } = await import('@/services/userAnalysisService');
            
            console.log('💾 Syncing analysis to database for user:', user.id);
            
            // First save the address
            const addressId = await saveAddress(
              user.id,
              propertyAddress,
              addressCoordinates,
              propertyAddress,
              true // Set as primary address for now
            );
            
            if (addressId) {
              // Then save the analysis results
              const analysisId = await savePropertyAnalysis(
                user.id,
                addressId,
                results,
                addressCoordinates
              );
              
              if (analysisId) {
                console.log('✅ Successfully synced analysis to database');
                toast({
                  title: "Analysis Saved",
                  description: "Your property analysis has been saved to your dashboard",
                });
              }
            }
          } catch (error) {
            console.error('❌ Failed to sync analysis to database:', error);
            // Don't show error toast as the analysis still worked locally
            console.log('Analysis will be available locally but not saved to dashboard');
          }
        }
      },
      setAnalysisComplete,
      setUseLocalAnalysis,
      setAnalysisError,
      toast
    });
  };

  return (
    <GoogleMapContext.Provider
      value={{
        mapInstance,
        setMapInstance,
        address,
        setAddress,
        isAnalyzing,
        setIsAnalyzing,
        analysisComplete,
        setAnalysisComplete,
        analysisResults,
        setAnalysisResults,
        mapLoaded,
        setMapLoaded,
        addressCoordinates,
        setAddressCoordinates,
        generatePropertyAnalysis: handlePropertyAnalysis,
        isGeneratingAnalysis,
        analysisError,
        setAnalysisError,
        useLocalAnalysis,
        setUseLocalAnalysis,
        zoomLevel,
        setZoomLevel
      }}
    >
      {children}
    </GoogleMapContext.Provider>
  );
};

export const useGoogleMap = () => {
  const context = useContext(GoogleMapContext);
  if (context === undefined) {
    throw new Error('useGoogleMap must be used within a GoogleMapProvider');
  }
  return context;
};
