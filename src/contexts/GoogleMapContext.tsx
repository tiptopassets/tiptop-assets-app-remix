
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GoogleMapContextType {
  mapInstance: google.maps.Map | null;
  setMapInstance: (map: google.maps.Map | null) => void;
  address: string;
  setAddress: (address: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisComplete: boolean;
  setAnalysisComplete: (complete: boolean) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  addressCoordinates: google.maps.LatLngLiteral | null;
  setAddressCoordinates: (coords: google.maps.LatLngLiteral | null) => void;
  generatePropertyAnalysis: (address: string) => Promise<void>;
  isGeneratingAnalysis: boolean;
}

export interface AssetOpportunity {
  icon: string;
  title: string;
  monthlyRevenue: number;
  description: string;
}

export interface AnalysisResults {
  propertyType: string;
  amenities: string[];
  rooftop: {
    area: number;
    solarCapacity: number;
    revenue: number;
  };
  garden: {
    area: number;
    opportunity: string;
    revenue: number;
  };
  parking: {
    spaces: number;
    rate: number;
    revenue: number;
  };
  pool: {
    present: boolean;
    area: number;
    type: string;
    revenue: number;
  };
  storage: {
    volume: number;
    revenue: number;
  };
  bandwidth: {
    available: number;
    revenue: number;
  };
  shortTermRental: {
    nightlyRate: number;
    monthlyProjection: number;
  };
  permits: string[];
  restrictions: string;
  topOpportunities: AssetOpportunity[];
}

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

  // Generate property analysis using GPT
  const generatePropertyAnalysis = async (propertyAddress: string) => {
    if (!propertyAddress) {
      toast({
        title: "Address Required",
        description: "Please enter a property address to analyze",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingAnalysis(true);
      setIsAnalyzing(true);
      
      // Call Supabase Edge Function to generate property analysis with GPT
      const { data, error } = await supabase.functions.invoke('analyze-property', {
        body: { 
          address: propertyAddress,
          coordinates: addressCoordinates
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data && data.analysis) {
        // Set the analysis results from GPT
        setAnalysisResults(data.analysis);
        setAnalysisComplete(true);
      } else {
        throw new Error("No analysis data received");
      }
      
    } catch (error) {
      console.error("Error generating property analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "We couldn't analyze this property. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
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
        generatePropertyAnalysis,
        isGeneratingAnalysis,
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
