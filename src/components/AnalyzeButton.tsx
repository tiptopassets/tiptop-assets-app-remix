
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AssetOpportunity } from '@/contexts/GoogleMapContext';

const AnalyzeButton = () => {
  const { 
    address, 
    setIsAnalyzing, 
    setAnalysisComplete, 
    setAnalysisResults 
  } = useGoogleMap();
  const [isDisabled, setIsDisabled] = useState(false);
  const { toast } = useToast();

  // Mock analysis results
  const mockAnalysisResults = {
    propertyType: "single-family",
    amenities: ["rooftop", "garden", "parking", "storage"],
    rooftop: {
      area: 1200,
      solarCapacity: 18,
      revenue: 72
    },
    garden: {
      area: 500,
      opportunity: "High",
      revenue: 30
    },
    parking: {
      spaces: 2,
      rate: 15,
      revenue: 900
    },
    pool: {
      present: false,
      area: 0,
      type: "none",
      revenue: 0
    },
    storage: {
      volume: 50,
      revenue: 100
    },
    bandwidth: {
      available: 250,
      revenue: 20
    },
    shortTermRental: {
      nightlyRate: 120,
      monthlyProjection: 2500
    },
    permits: ["solar installation", "commercial parking"],
    restrictions: "No short-term rentals under 30 days by HOA rules",
    topOpportunities: [
      {
        icon: "parking",
        title: "Parking Space",
        monthlyRevenue: 900,
        description: "2 spaces available for rent"
      },
      {
        icon: "solar",
        title: "Rooftop Solar",
        monthlyRevenue: 72,
        description: "1200 sq ft usable with 18kW potential"
      },
      {
        icon: "storage",
        title: "Storage Space",
        monthlyRevenue: 100,
        description: "50 cubic meters available"
      },
      {
        icon: "wifi",
        title: "Internet Bandwidth",
        monthlyRevenue: 20,
        description: "250 Mbps available for sharing"
      }
    ] as AssetOpportunity[]
  };
  
  const handleAnalyze = () => {
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please enter your property address first",
        variant: "destructive",
      });
      return;
    }

    setIsDisabled(true);
    setIsAnalyzing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setAnalysisResults(mockAnalysisResults);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setIsDisabled(false);
      
      toast({
        title: "Analysis Complete",
        description: "We've identified 4 monetization opportunities for your property",
      });
    }, 3000);
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={isDisabled}
      className={`glass-effect glow-effect px-8 py-3 rounded-full flex items-center justify-center text-white font-medium text-lg
        bg-tiptop-purple
        ${isDisabled ? 'opacity-70 cursor-not-allowed' : 'animate-pulse-glow hover:scale-105 transition-transform'}`}
    >
      {isDisabled ? (
        <>
          <div className="h-5 w-5 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          Analyzing...
        </>
      ) : (
        'Analyze now'
      )}
    </button>
  );
};

export default AnalyzeButton;
