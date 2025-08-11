import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps, geocodeAddress } from '@/utils/googleMapsLoader';

export type PlaceSelection = {
  address: string;
  coordinates: google.maps.LatLngLiteral;
  placeId?: string;
};

interface Props {
  onSelect: (selection: PlaceSelection) => void;
  placeholder?: string;
  className?: string;
}

const PlaceAutocompleteElement: React.FC<Props> = ({ onSelect, placeholder = 'Search your address', className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  useEffect(() => {
    let cleanup = () => {};

    const init = async () => {
      try {
        await loadGoogleMaps();
        
        // Load Places Library explicitly for Extended Components
        const placesLib = await (google.maps as any).importLibrary('places');
        console.log('Places Library loaded:', placesLib);
        
        if (!window.google?.maps?.places) {
          console.error('Places library not available');
          return;
        }

        // Create the element
        const el = document.createElement('gmp-place-autocomplete') as google.maps.places.PlaceAutocompleteElement;
        console.log('Created element:', el, 'Constructor:', el.constructor.name);

        // Configure element attributes
        el.setAttribute('placeholder', placeholder);
        el.setAttribute('types', 'address');
        
        // Style the element with proper theme colors
        Object.assign(el.style, {
          width: '100%',
          height: '40px',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          padding: '8px 12px',
          border: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          '--gmp-color-primary': 'hsl(var(--primary))',
          '--gmp-color-surface': 'hsl(var(--background))',
          '--gmp-color-on-surface': 'hsl(var(--foreground))',
          '--gmp-font-family': 'inherit',
          '--gmp-font-size': '14px'
        });

        // Inject global styles for Shadow DOM theming
        const styleId = 'gmp-places-global-styles';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            gmp-place-autocomplete {
              --gmp-color-surface: hsl(var(--background));
              --gmp-color-on-surface: hsl(var(--foreground));
              --gmp-color-on-surface-variant: hsl(var(--muted-foreground));
              --gmp-color-primary: hsl(var(--primary));
              --gmp-color-outline: hsl(var(--border));
            }
          `;
          document.head.appendChild(style);
        }

        // Comprehensive debugging and event handling
        let isProcessing = false;
        
        const processPlaceSelection = async (eventData: any, source: string) => {
          if (isProcessing) return;
          isProcessing = true;
          
          console.log(`🔍 Processing place selection from ${source}`);
          console.log('Event data structure:', eventData);
          console.log('Element properties:', Object.getOwnPropertyNames(el));
          
          // Check multiple possible sources for place data
          let place = null;
          
          // Method 1: From event data
          if (eventData?.place) place = eventData.place;
          if (!place && eventData?.detail?.place) place = eventData.detail.place;
          
          // Method 2: From element properties  
          if (!place && (el as any).place) place = (el as any).place;
          if (!place && (el as any).getPlace) {
            try {
              place = (el as any).getPlace();
            } catch (e) {
              console.log('getPlace() method failed:', e);
            }
          }
          
          // Method 3: Check for any place-related properties on element
          if (!place) {
            const placeProps = Object.getOwnPropertyNames(el).filter(prop => 
              prop.toLowerCase().includes('place') || prop.toLowerCase().includes('selected')
            );
            console.log('Place-related properties on element:', placeProps);
            for (const prop of placeProps) {
              try {
                const val = (el as any)[prop];
                if (val && typeof val === 'object') {
                  console.log(`Found potential place object in ${prop}:`, val);
                  place = val;
                  break;
                }
              } catch (e) {
                console.log(`Error accessing ${prop}:`, e);
              }
            }
          }
          
          console.log('Final place object:', place);
          
          if (!place) {
            console.log('❌ No place object found anywhere. Trying input value fallback...');
            // Fallback: Get text from input and geocode
            const inputEl = el.querySelector('input') || el;
            const value = (inputEl as any)?.value || el.getAttribute('value') || '';
            console.log('Input value for fallback:', value);
            
            if (value && value.length > 3) {
              try {
                const coords = await geocodeAddress(value);
                if (coords) {
                  console.log('✅ Geocoded fallback successful');
                  onSelect({ address: value, coordinates: coords });
                }
              } catch (e) {
                console.error('Geocoding fallback failed:', e);
              }
            }
            isProcessing = false;
            return;
          }
          
          // Process the place object
          try {
            // First try to fetch fields if method exists
            if (place.fetchFields && typeof place.fetchFields === 'function') {
              try {
                await place.fetchFields({ fields: ['formattedAddress', 'location', 'id'] });
                console.log('Fields fetched successfully');
              } catch (e) {
                console.log('fetchFields failed:', e);
              }
            }
            
            // Extract address
            let address = place.formattedAddress || 
                         place.formatted_address || 
                         place.displayName ||
                         place.display_name ||
                         place.name;
            
            // Extract coordinates
            let coordinates = null;
            const loc = place.location || place.geometry?.location;
            if (loc) {
              if (typeof loc.lat === 'function') {
                coordinates = { lat: loc.lat(), lng: loc.lng() };
              } else if (loc.lat && loc.lng) {
                coordinates = { lat: loc.lat, lng: loc.lng };
              }
            }
            
            // Extract place ID
            const placeId = place.id || place.placeId || place.place_id;
            
            console.log('Extracted data:', { address, coordinates, placeId });
            
            if (address && coordinates) {
              console.log('✅ Successfully processed place selection');
              onSelect({ address, coordinates, placeId });
            } else {
              console.log('❌ Incomplete place data, trying Places Details API...');
              
              // Try Places Details API if we have a place ID
              if (placeId && google.maps.places.PlacesService) {
                const service = new google.maps.places.PlacesService(document.createElement('div'));
                service.getDetails(
                  { placeId, fields: ['formatted_address', 'geometry'] },
                  (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                      const addr = result.formatted_address;
                      const geom = result.geometry?.location;
                      if (addr && geom) {
                        const coords = { lat: geom.lat(), lng: geom.lng() };
                        console.log('✅ Places Details API successful');
                        onSelect({ address: addr, coordinates: coords, placeId });
                      }
                    } else {
                      console.error('Places Details API failed:', status);
                    }
                  }
                );
              }
            }
          } catch (e) {
            console.error('Error processing place:', e);
          } finally {
            isProcessing = false;
          }
        };

        // Primary event handler for place selection
        const handlePlaceSelect = (e: any) => {
          console.log('🎯 gmp-placeselect event fired');
          console.log('Event object:', e);
          console.log('Event type:', e.type);
          console.log('Event target:', e.target);
          processPlaceSelection(e, 'gmp-placeselect');
        };

        // Add event listener
        el.addEventListener('gmp-placeselect', handlePlaceSelect);
        
        // Also try alternative event names in case the API uses different events
        const alternativeEvents = ['place_changed', 'placeselect', 'place-select', 'selection'];
        alternativeEvents.forEach(eventName => {
          el.addEventListener(eventName, (e) => {
            console.log(`🎯 Alternative event fired: ${eventName}`);
            processPlaceSelection(e, eventName);
          });
        });

        // Keyboard fallback
        el.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            setTimeout(() => {
              if (!isProcessing) {
                console.log('🎯 Enter key fallback triggered');
                processPlaceSelection({ type: 'keydown' }, 'enter-fallback');
              }
            }, 200);
          }
        });

        // Mount element
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(el);
        }

        elementRef.current = el;
        console.log('✅ Places Element initialized and mounted');

        cleanup = () => {
          el.removeEventListener('gmp-placeselect', handlePlaceSelect);
          alternativeEvents.forEach(eventName => {
            el.removeEventListener(eventName, handlePlaceSelect);
          });
          if (containerRef.current?.contains(el)) {
            containerRef.current.removeChild(el);
          }
          elementRef.current = null;
        };

      } catch (error) {
        console.error('❌ PlaceAutocompleteElement initialization failed:', error);
      }
    };

    init();
    return () => cleanup();
  }, [onSelect, placeholder]);

  return (
    <div 
      ref={containerRef} 
      className={className ? className : 'w-full'} 
      style={{ 
        position: 'relative',
        zIndex: 9999,
        backgroundColor: 'transparent'
      }}
    />
  );
};

export default PlaceAutocompleteElement;
