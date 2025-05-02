
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
    mapLoaded
  } = useGoogleMap();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();

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
          
          // Center map to selected address
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(18);
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
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
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
