
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, XCircle } from 'lucide-react';
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
    analysisComplete,
    setAddressCoordinates,
    generatePropertyAnalysis,
    isGeneratingAnalysis,
    analysisError,
    setAnalysisError
  } = useGoogleMap();
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Start analysis when an address is selected
  const startAnalysis = () => {
    if (!address) {
      return;
    }

    // Clear previous errors
    if (analysisError) {
      setAnalysisError(null);
    }

    // Use the GPT-powered analysis 
    generatePropertyAnalysis(address);
  }

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      });
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update map to center on user location
        if (mapInstance) {
          const userLocation = new google.maps.LatLng(latitude, longitude);
          mapInstance.setCenter(userLocation);
          mapInstance.setZoom(18);
          
          // Save coordinates
          setAddressCoordinates({ lat: latitude, lng: longitude });
          
          // Use Geocoder to get address from coordinates
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setIsLocating(false);
            
            if (status === "OK" && results && results[0]) {
              const formattedAddress = results[0].formatted_address;
              setAddress(formattedAddress);
              setHasSelectedAddress(true);
              
              // Auto trigger analysis
              startAnalysis();
            } else {
              toast({
                title: "Location Found",
                description: "Address could not be determined, but location has been set.",
              });
            }
          });
        } else {
          setIsLocating(false);
          toast({
            title: "Error",
            description: "Map is not loaded yet. Please try again.",
            variant: "destructive"
          });
        }
      },
      (error) => {
        setIsLocating(false);
        
        let errorMessage = "Unknown error occurred while getting your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Geolocation Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Clear search and reset analysis state
  const clearSearch = () => {
    setAddress('');
    setHasSelectedAddress(false);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setAnalysisError(null);
    
    if (mapInstance) {
      mapInstance.setCenter({ lat: 37.7749, lng: -122.4194 });
      mapInstance.setZoom(18);
    }
  };

  useEffect(() => {
    if (!mapLoaded || !searchInputRef.current || !window.google) return;

    try {
      // Initialize the Places Autocomplete - removed US restriction
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
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
          
          // Save coordinates
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setAddressCoordinates({ lat, lng });
          
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
  }, [mapLoaded, mapInstance, setAddress, toast, setAddressCoordinates]);

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
            
            // Clear error state when user starts typing again
            if (analysisError) {
              setAnalysisError(null);
            }
          }}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-300"
        />
        
        {/* Clear button - only show when has address */}
        {address && (
          <button
            onClick={clearSearch}
            className="flex items-center justify-center h-10 w-10 rounded-full text-white/70 hover:text-white transition-colors"
            title="Clear search"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
        
        {/* Geolocation button */}
        <button 
          onClick={getUserLocation}
          disabled={isLocating || !mapLoaded || isGeneratingAnalysis}
          className={`flex items-center justify-center h-10 w-10 rounded-full mr-1 transition-all
            ${isLocating || isGeneratingAnalysis ? 'bg-purple-500/30' : 'bg-purple-500/20 hover:bg-purple-500/40'}`}
          title="Use current location"
        >
          <MapPin className={`h-5 w-5 text-white ${isLocating ? 'animate-pulse' : ''}`} />
        </button>
        
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
