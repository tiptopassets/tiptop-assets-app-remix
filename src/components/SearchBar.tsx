
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';

type SearchBarProps = {
  isCollapsed: boolean;
};

const SearchBar = ({ isCollapsed }: SearchBarProps) => {
  const { 
    mapInstance, 
    address, 
    setAddress,
    mapLoaded,
    setIsAnalyzing,
    setAnalysisComplete,
    setAnalysisResults,
    analysisComplete
  } = useGoogleMap();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);

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
    ] 
  };

  // Start analysis when an address is selected
  const startAnalysis = () => {
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please enter your property address first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setAnalysisResults(mockAnalysisResults);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      
      toast({
        title: "Analysis Complete",
        description: "We've identified 4 monetization opportunities for your property",
      });
    }, 3000);
  }

  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current || !window.google) return;

    try {
      // Initialize the Places Autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry']
      });

      // Add listener for place changed
      autocompleteRef.current.addListener('place_changed', () => {
        if (!autocompleteRef.current) return;
        
        const place = autocompleteRef.current.getPlace();
        if (place.geometry && place.geometry.location && mapInstance) {
          // Set the address
          setAddress(place.formatted_address || '');
          setHasSelectedAddress(true);
          
          // Center map to selected address
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(18);
          
          // Auto trigger analysis when address is selected
          startAnalysis();
        }
      });
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
      toast({
        title: "Error",
        description: "Failed to load address search. Please try again later.",
        variant: "destructive"
      });
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [mapLoaded, mapInstance, setAddress, toast]);

  return (
    <div className={`relative w-full ${isCollapsed ? 'max-w-md' : 'max-w-xl'} transition-all duration-500 ease-in-out`}>
      <div className="glass-effect flex items-center h-14 pl-4 pr-2 rounded-full relative overflow-hidden glow-effect">
        <Search className="text-tiptop-purple h-5 w-5 mr-2" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search your address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setHasSelectedAddress(false);
          }}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-300"
        />
        {/* Add light reflection effect */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
            borderRadius: 'inherit'
          }}
        ></div>
      </div>
    </div>
  );
};

export default SearchBar;
