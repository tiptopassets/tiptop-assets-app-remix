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
        // Ensure the places library is initialized (defensive)
        try { await (google.maps as any).importLibrary?.('places'); } catch {}
        if (!window.google?.maps?.places) return;

        // Create the element using correct constructor
        const el = document.createElement('gmp-place-autocomplete') as google.maps.places.PlaceAutocompleteElement;
        console.log('Created Places Element:', el);

        // Set attributes/options
        el.setAttribute('placeholder', placeholder);
        el.setAttribute('types', 'address');
        
        // Apply basic styling to the element
        const host = el as HTMLElement;
        host.style.width = '100%';
        host.style.height = '40px';
        host.style.background = 'hsl(var(--background))';
        host.style.border = '1px solid hsl(var(--border))';
        host.style.borderRadius = '6px';
        host.style.fontSize = '14px';
        host.style.fontFamily = 'inherit';
        host.style.padding = '8px 12px';
        host.style.color = 'hsl(var(--foreground))';
        
        // Correct Google Places Element CSS variables (research-verified property names)
        host.style.setProperty('--gmp-color-primary', 'hsl(var(--primary))');
        host.style.setProperty('--gmp-font-family', 'inherit');
        host.style.setProperty('--gmp-font-size', '14px');
        
        // Add global styles for the dropdown (penetrates Shadow DOM)
        const styleId = 'gmp-places-styles';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            gmp-place-autocomplete {
              --gmp-color-surface: hsl(var(--background)) !important;
              --gmp-color-on-surface: hsl(var(--foreground)) !important;
              --gmp-color-on-surface-variant: hsl(var(--muted-foreground)) !important;
              --gmp-color-primary: hsl(var(--primary)) !important;
              --gmp-color-outline: hsl(var(--border)) !important;
              border-radius: 6px !important;
            }
            
            gmp-place-autocomplete::part(option) {
              background-color: hsl(var(--background)) !important;
              color: hsl(var(--foreground)) !important;
              border-color: hsl(var(--border)) !important;
            }
            
            gmp-place-autocomplete::part(option):hover {
              background-color: hsl(var(--accent)) !important;
              color: hsl(var(--accent-foreground)) !important;
            }
          `;
          document.head.appendChild(style);
        }

        // Comprehensive event handling with debugging
        let selectionHandled = false;
        
        const handlePlaceSelection = async (place: any, eventSource: string) => {
          console.log(`🔍 Place selection from ${eventSource}:`, place);
          
          if (selectionHandled) {
            console.log('Selection already handled, skipping');
            return;
          }

          if (!place) {
            console.log('❌ No place object found');
            return;
          }

          selectionHandled = true;
          
          try {
            // Attempt to fetch needed fields to ensure we have address + location
            try {
              if (typeof place.fetchFields === 'function') {
                await place.fetchFields({ fields: ['formattedAddress', 'location', 'id'] });
              }
            } catch {}

            // Safe field access to avoid API-version property errors
            let formattedAddress: string | undefined;
            let locAny: any;
            let pidSafe: string | undefined;
            
            try { formattedAddress = place.formattedAddress; } catch {}
            try { if (!formattedAddress) formattedAddress = place.displayName; } catch {}
            try { if (!formattedAddress) formattedAddress = place.display_name; } catch {}
            try { locAny = place.location; } catch {}
            try { pidSafe = place.id || place.placeId || place.place_id; } catch {}

            let coordinates: google.maps.LatLngLiteral | null = null;
            if (locAny) {
              if (typeof locAny.lat === 'function') {
                coordinates = { lat: locAny.lat(), lng: locAny.lng() };
              } else {
                coordinates = locAny;
              }
            }

            // Fallback: Places Details via placeId if needed
            if ((!formattedAddress || !coordinates) && pidSafe && window.google?.maps?.places?.PlacesService) {
              try {
                const details: any = await new Promise((resolve) => {
                  const svc = new google.maps.places.PlacesService(document.createElement('div'));
                  svc.getDetails(
                    { placeId: pidSafe!, fields: ['formatted_address', 'geometry', 'place_id'] },
                    (res: any, status: any) => resolve({ res, status })
                  );
                });
                if (details?.res && details.status === google.maps.places.PlacesServiceStatus.OK) {
                  if (!formattedAddress) formattedAddress = details.res.formatted_address;
                  if (!coordinates && details.res.geometry?.location) {
                    const ll = details.res.geometry.location;
                    coordinates = { lat: ll.lat(), lng: ll.lng() };
                  }
                  pidSafe = details.res.place_id ?? pidSafe;
                }
              } catch {}
            }

            // Fallback: Geocode if we have an address but no coordinates
            if (formattedAddress && !coordinates) {
              try {
                const geocoded = await geocodeAddress(formattedAddress);
                if (geocoded) coordinates = geocoded;
              } catch {}
            }

            if (formattedAddress && coordinates) {
              console.log('✅ Calling onSelect with:', { address: formattedAddress, coordinates, placeId: pidSafe });
              onSelect({ address: formattedAddress, coordinates, placeId: pidSafe });
            } else {
              // Last resort: read current input value and geocode
              const rawVal = (el as any)?.value ?? (el as any)?.getAttribute?.('value');
              const val = typeof rawVal === 'string' ? rawVal.trim() : '';
              if (val && val.length > 5) {
                try {
                  const coords = await geocodeAddress(val);
                  if (coords) {
                    console.log('✅ Calling onSelect with geocoded address:', { address: val, coordinates: coords });
                    onSelect({ address: val, coordinates: coords });
                  }
                } catch {}
              }
            }
            
            // Reset flag after delay
            setTimeout(() => {
              selectionHandled = false;
            }, 1000);
            
          } catch (err) {
            console.error('❌ Error in place selection:', err);
            selectionHandled = false;
          }
        };

        // Event handlers using the unified function
        const selectHandler = async (e: any) => {
          console.log('gmp-placeselect event triggered');
          const place = e.detail?.place || e.place || (el as any).place;
          await handlePlaceSelection(place, 'gmp-placeselect');
        };

        // Enter key fallback: if the element doesn't emit a select event, geocode the current value
        const keydownHandler = (ev: KeyboardEvent) => {
          if (ev.key === 'Enter') {
            window.setTimeout(async () => {
              try {
                if (selectionHandled) return;
                const rawVal = (el as any)?.value ?? (el as any)?.getAttribute?.('value');
                const val = typeof rawVal === 'string' ? rawVal.trim() : '';
                if (val && val.length > 5) {
                  const coords = await geocodeAddress(val);
                  if (coords) {
                    selectionHandled = true;
                    onSelect({ address: val, coordinates: coords });
                  }
                }
              } catch {}
            }, 600);
          }
        };

        // Add event listeners with proper handling
        el.addEventListener('gmp-placeselect', selectHandler);
        el.addEventListener('keydown', keydownHandler);
        
        // Also listen for click events on the dropdown items as fallback
        el.addEventListener('click', async (e: any) => {
          console.log('Click event on Places Element');
          // Small delay to let Google handle the selection first
          setTimeout(() => selectHandler(e), 100);
        });
        
        console.log('Event listeners added to element');

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(el as unknown as Node);
        }

        elementRef.current = el;

        cleanup = () => {
          try {
            el.removeEventListener('gmp-placeselect', selectHandler as EventListener);
            el.removeEventListener('keydown', keydownHandler as unknown as EventListener);
          } catch {}
          try {
            if (containerRef.current && el.parentElement === containerRef.current) {
              containerRef.current.removeChild(el as unknown as Node);
            }
          } catch {}
          elementRef.current = null;
        };
      } catch (error) {
        console.error('PlaceAutocompleteElement: init error', error);
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
