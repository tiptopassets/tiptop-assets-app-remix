
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useToast } from '@/hooks/use-toast';

type GeoLocationButtonProps = {
  onLocationFound: (address: string) => void;
  disabled?: boolean;
};

const GeoLocationButton = ({ onLocationFound, disabled = false }: GeoLocationButtonProps) => {
  const { 
    mapInstance,
    setAddressCoordinates,
  } = useGoogleMap();
  
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

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
              onLocationFound(formattedAddress);
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

  return (
    <button 
      onClick={getUserLocation}
      disabled={isLocating || disabled}
      className={`flex items-center justify-center h-10 w-10 rounded-full mr-1 transition-all
        ${isLocating || disabled ? 'bg-purple-500/30' : 'bg-purple-500/20 hover:bg-purple-500/40'}`}
      title="Use current location"
    >
      <MapPin className={`h-5 w-5 text-white ${isLocating ? 'animate-pulse' : ''}`} />
    </button>
  );
};

export default GeoLocationButton;
