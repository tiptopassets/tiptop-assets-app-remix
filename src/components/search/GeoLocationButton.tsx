
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GeoLocationButtonProps = {
  onLocationFound: (address: string, coordinates: google.maps.LatLngLiteral) => void;
  disabled?: boolean;
};

const GeoLocationButton = ({ onLocationFound, disabled = false }: GeoLocationButtonProps) => {
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const handleGetCurrentLocation = () => {
    if (disabled || isLocating) return;
    
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      });
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const coordinates = { lat: latitude, lng: longitude };
          
          // Use Google's Geocoder to get address from coordinates
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: coordinates }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              onLocationFound(results[0].formatted_address, coordinates);
            } else {
              toast({
                title: "Geocoding Error",
                description: "Could not find an address for your location",
                variant: "destructive"
              });
            }
            setIsLocating(false);
          });
        } catch (error) {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Failed to get your current location",
            variant: "destructive"
          });
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        let message = "Failed to get your current location";
        if (error.code === 1) {
          message = "Location access was denied. Please allow location access to use this feature.";
        } else if (error.code === 2) {
          message = "Your location is unavailable. Please try again later.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again.";
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive"
        });
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <button
      onClick={handleGetCurrentLocation}
      className={`flex items-center justify-center h-10 w-10 rounded-full text-white/70 hover:text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Use my current location"
      disabled={disabled || isLocating}
    >
      {isLocating ? (
        <span className="animate-spin h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full" />
      ) : (
        <MapPin className="h-5 w-5" />
      )}
    </button>
  );
};

export default GeoLocationButton;
