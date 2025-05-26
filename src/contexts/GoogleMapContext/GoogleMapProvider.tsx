
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GoogleMapContextType, AnalysisResults } from './types';
import { generatePropertyAnalysis } from './propertyAnalysis';
import { useToast } from '@/hooks/use-toast';
import { usePropertyPersistence } from '@/hooks/usePropertyPersistence';

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
  const { saveAnalysis, getCurrentAnalysis } = usePropertyPersistence();

  // Load persisted analysis on mount
  useEffect(() => {
    const loadPersistedAnalysis = async () => {
      const persistedData = await getCurrentAnalysis();
      if (persistedData) {
        setAddress(persistedData.address);
        setAddressCoordinates(persistedData.coordinates);
        setAnalysisResults(persistedData.analysisResults);
        setAnalysisComplete(true);
      }
    };

    loadPersistedAnalysis();
  }, [getCurrentAnalysis]);

  const handlePropertyAnalysis = async (propertyAddress: string) => {
    await generatePropertyAnalysis({
      propertyAddress,
      addressCoordinates,
      useLocalAnalysis,
      setIsGeneratingAnalysis,
      setIsAnalyzing,
      setAnalysisResults: (results) => {
        setAnalysisResults(results);
        
        // Save to persistence when analysis completes
        if (results && propertyAddress && addressCoordinates) {
          const totalRevenue = results.topOpportunities.reduce((sum, opp) => sum + opp.monthlyRevenue, 0);
          
          saveAnalysis({
            address: propertyAddress,
            coordinates: addressCoordinates,
            analysisResults: results,
            propertyType: results.propertyType || 'Unknown',
            totalMonthlyRevenue: totalRevenue,
            totalOpportunities: results.topOpportunities.length
          });
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
