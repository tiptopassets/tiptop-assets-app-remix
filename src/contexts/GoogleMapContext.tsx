
import { createContext, useContext, useState, ReactNode } from 'react';

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
