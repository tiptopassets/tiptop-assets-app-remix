import { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleMapContextType, AnalysisResults } from './types';
import { generatePropertyAnalysis } from './propertyAnalysis';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { saveUnauthenticatedAnalysis } from '@/services/unauthenticatedAnalysisService';

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
    console.log('🚀 Starting property analysis for:', propertyAddress, 'User:', user?.id);
    
    if (!propertyAddress) {
      console.error('❌ No property address provided');
      toast({
        title: "Address Required",
        description: "Please enter a property address to analyze",
        variant: "destructive"
      });
      return;
    }

    // Reset any previous errors
    setAnalysisError(null);
    
    try {
      await generatePropertyAnalysis({
        propertyAddress,
        addressCoordinates,
        useLocalAnalysis,
        setIsGeneratingAnalysis,
        setIsAnalyzing,
        setAnalysisResults: async (results: AnalysisResults | null) => {
          console.log('📊 Analysis results received:', !!results);
          setAnalysisResults(results);
          
          if (!results || !propertyAddress) {
            console.log('ℹ️ No results or address to save');
            return;
          }
          
          // Save to database if user is authenticated
          if (user && !authLoading) {
            try {
              console.log('💾 Attempting to save analysis to database...');
              
              // Import the service functions
              const { saveAddress } = await import('@/services/userAddressService');
              const { savePropertyAnalysis } = await import('@/services/userAnalysisService');
              
              // First save the address
              console.log('📍 Saving address to database...');
              const addressId = await saveAddress(
                user.id,
                propertyAddress,
                addressCoordinates,
                propertyAddress,
                true // Set as primary address for now
              );
              
              if (addressId) {
                console.log('✅ Address saved with ID:', addressId);
                
                // Then save the analysis results
                console.log('📊 Saving analysis results to database...');
                const analysisId = await savePropertyAnalysis(
                  user.id,
                  addressId,
                  results,
                  addressCoordinates
                );
                
                if (analysisId) {
                  console.log('✅ Analysis saved with ID:', analysisId);
                } else {
                  console.error('❌ Failed to save analysis - no ID returned');
                }
              } else {
                console.error('❌ Failed to save address - no ID returned');
              }
            } catch (error) {
              console.error('❌ Failed to save analysis to database:', error);
            }
          } else {
            // Save to localStorage for unauthenticated users
            console.log('📱 User not authenticated - saving to localStorage');
            saveUnauthenticatedAnalysis(
              propertyAddress,
              results,
              addressCoordinates,
              propertyAddress
            );
          }
        },
        setAnalysisComplete,
        setUseLocalAnalysis,
        setAnalysisError,
        toast
      });
    } catch (error) {
      console.error('❌ Error in handlePropertyAnalysis:', error);
      setAnalysisError('Failed to analyze property. Please try again.');
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your property. Please try again.",
        variant: "destructive"
      });
    }
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
