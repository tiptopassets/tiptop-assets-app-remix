
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { imageUrlToBase64, generateMapImageUrls } from '@/contexts/ModelGeneration/utils';

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
  analysisError: string | null;
  setAnalysisError: (error: string | null) => void;
  useLocalAnalysis: boolean;
  setUseLocalAnalysis: (useLocal: boolean) => void;
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
  imageAnalysisSummary?: string;
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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [useLocalAnalysis, setUseLocalAnalysis] = useState(false);
  const { toast } = useToast();

  // Generate local mock analysis for fallback use
  const generateLocalMockAnalysis = (propertyAddress: string) => {
    // Create a stable pseudo-random number generator based on address string
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    };
    
    const addressHash = Math.abs(hashCode(propertyAddress));
    const rand = (min: number, max: number) => Math.floor((addressHash % 1000) / 1000 * (max - min) + min);
    
    // Generate mock data with some deterministic variation based on address
    const mockResults: AnalysisResults = {
      propertyType: addressHash % 3 === 0 ? "Commercial" : "Residential",
      amenities: ["Parking", "Garden", "Storage"],
      rooftop: {
        area: rand(500, 2000),
        solarCapacity: rand(3, 15),
        revenue: rand(80, 300)
      },
      garden: {
        area: rand(200, 1000),
        opportunity: ["Low", "Medium", "High"][rand(0, 3)],
        revenue: rand(30, 150)
      },
      parking: {
        spaces: rand(1, 5),
        rate: rand(5, 20),
        revenue: rand(50, 200)
      },
      pool: {
        present: addressHash % 5 === 0,
        area: rand(0, 400),
        type: "inground",
        revenue: addressHash % 5 === 0 ? rand(100, 300) : 0
      },
      storage: {
        volume: rand(50, 300),
        revenue: rand(40, 120)
      },
      bandwidth: {
        available: rand(50, 200),
        revenue: rand(10, 50)
      },
      shortTermRental: {
        nightlyRate: rand(50, 200),
        monthlyProjection: rand(500, 2500)
      },
      permits: ["Zoning permit", "Business license"],
      restrictions: "Check local regulations before monetizing your property.",
      topOpportunities: [
        {
          icon: "solar",
          title: "Solar Panels",
          monthlyRevenue: rand(80, 250),
          description: "Install solar panels on your rooftop."
        },
        {
          icon: "parking",
          title: "Parking Space",
          monthlyRevenue: rand(50, 200),
          description: "Rent out your parking spaces."
        },
        {
          icon: "storage",
          title: "Storage Space",
          monthlyRevenue: rand(40, 120),
          description: "Offer storage space rental."
        },
        {
          icon: "wifi",
          title: "Internet Sharing",
          monthlyRevenue: rand(10, 50),
          description: "Share your internet bandwidth."
        }
      ],
      imageAnalysisSummary: "This property appears to have good solar potential with an open rooftop area."
    };
    
    return mockResults;
  };

  // Generate property analysis using GPT with satellite image
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
      // Reset error state when starting a new analysis
      setAnalysisError(null);
      setIsGeneratingAnalysis(true);
      setIsAnalyzing(true);
      
      // If using local analysis (fallback mode), generate mock data
      if (useLocalAnalysis) {
        setTimeout(() => {
          const mockResults = generateLocalMockAnalysis(propertyAddress);
          setAnalysisResults(mockResults);
          setAnalysisComplete(true);
          setIsGeneratingAnalysis(false);
          setIsAnalyzing(false);
          
          toast({
            title: "Analysis Complete",
            description: `Found ${mockResults.topOpportunities.length} monetization opportunities for your property (Demo mode)`,
          });
        }, 2000); // Simulate a delay
        return;
      }
      
      // Get satellite image if we have coordinates
      let satelliteImage = null;
      if (addressCoordinates) {
        try {
          const { satelliteImageUrl } = generateMapImageUrls(addressCoordinates);
          satelliteImage = await imageUrlToBase64(satelliteImageUrl);
          console.log("Captured satellite image for analysis");
        } catch (err) {
          console.error("Failed to capture satellite image:", err);
        }
      }
      
      // Show toast notification about image analysis
      if (satelliteImage) {
        toast({
          title: "Processing Images",
          description: "Using AI to analyze satellite imagery for your property",
        });
      }
      
      // Call Supabase Edge Function to generate property analysis with GPT
      const { data, error } = await supabase.functions.invoke('analyze-property', {
        body: { 
          address: propertyAddress,
          coordinates: addressCoordinates,
          satelliteImage: satelliteImage
        }
      });
      
      if (error) {
        // Check if it's a quota error
        if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
          console.log("API quota exceeded, switching to fallback mode");
          setUseLocalAnalysis(true);
          toast({
            title: "API Quota Exceeded",
            description: "Using fallback mode for analysis. Results will be approximate.",
          });
          // Retry with local analysis
          return generatePropertyAnalysis(propertyAddress);
        }
        throw new Error(error.message);
      }
      
      if (data && data.analysis) {
        // Set the analysis results from GPT
        setAnalysisResults(data.analysis);
        setAnalysisComplete(true);
        
        // Show toast with insight summary
        toast({
          title: "Analysis Complete",
          description: `Found ${data.analysis.topOpportunities.length} monetization opportunities for your property`,
        });
      } else {
        throw new Error("No analysis data received");
      }
      
    } catch (error) {
      console.error("Error generating property analysis:", error);
      
      // If we encounter an OpenAI API error, fall back to local analysis
      if (error instanceof Error && 
          (error.message.includes('OpenAI') || 
           error.message.includes('quota') || 
           error.message.includes('insufficient_quota'))) {
        
        console.log("OpenAI API error, switching to fallback mode");
        setUseLocalAnalysis(true);
        toast({
          title: "API Connection Issue",
          description: "Switching to demo mode. Results will be approximate.",
        });
        
        // Try again with local analysis
        return generatePropertyAnalysis(propertyAddress);
      }
      
      setAnalysisError("We couldn't analyze this property. Please try again later.");
      setAnalysisComplete(false);
      
      toast({
        title: "Analysis Failed",
        description: "We couldn't analyze this property. Please try again later.",
        variant: "destructive"
      });
    } finally {
      if (!useLocalAnalysis) {
        setIsGeneratingAnalysis(false);
        setIsAnalyzing(false);
      }
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
        analysisError,
        setAnalysisError,
        useLocalAnalysis,
        setUseLocalAnalysis,
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
