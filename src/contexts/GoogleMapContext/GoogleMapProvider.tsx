
import { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleMapContextType, AnalysisResults } from './types';
import { generatePropertyAnalysis } from './propertyAnalysis';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';
import { createDataSyncManager } from './dataSync';

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
  const userData = useUserData();
  const dataSyncManager = createDataSyncManager(userData);

  const handlePropertyAnalysis = async (propertyAddress: string) => {
    await generatePropertyAnalysis({
      propertyAddress,
      addressCoordinates,
      useLocalAnalysis,
      setIsGeneratingAnalysis,
      setIsAnalyzing,
      setAnalysisResults: async (results: AnalysisResults | null) => {
        setAnalysisResults(results);
        
        // Sync to database when analysis is complete
        if (results && propertyAddress) {
          try {
            await dataSyncManager.syncAnalysisToDatabase(
              propertyAddress, 
              results, 
              addressCoordinates
            );
            
            toast({
              title: "Analysis Saved",
              description: "Your property analysis has been saved to your account",
            });
          } catch (error) {
            console.error('Failed to sync analysis to database:', error);
            // Don't show error toast as the analysis still worked
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
