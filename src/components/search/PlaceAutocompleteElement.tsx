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
        
        // Apply styling using supported CSS custom properties
        const host = el as HTMLElement;
        host.style.width = '100%';
        host.style.height = '40px';
        host.style.background = 'transparent';
        host.style.border = 'none';
        host.style.outline = 'none';
        host.style.fontSize = '14px';
        host.style.fontFamily = 'inherit';
        
        // Set CSS custom properties for theming the shadow DOM
        host.style.setProperty('--gmp-dropdown-background-color', 'hsl(var(--popover))');
        host.style.setProperty('--gmp-dropdown-border-color', 'hsl(var(--border))');
        host.style.setProperty('--gmp-option-text-color', 'hsl(var(--foreground))');
        host.style.setProperty('--gmp-option-background-color', 'hsl(var(--popover))');
        host.style.setProperty('--gmp-option-background-color-hover', 'hsl(var(--accent))');
        host.style.setProperty('--gmp-primary-color', 'hsl(var(--primary))');
        host.style.setProperty('--gmp-text-color', 'hsl(var(--foreground))');
        host.style.setProperty('--gmp-font-family', 'inherit');
        host.style.setProperty('--gmp-font-size', '14px');

        // Listen for selection with proper event handling
        let selectionHandled = false;
        const selectHandler = async (e: any) => {
          console.log('Place selection event fired:', e);
          console.log('Event type:', e.type);
          console.log('Event data:', { place: e.place, detail: e.detail });
          
          try {
            // Access place directly from event (correct pattern for gmp-placeselect)
            const place = e.place;
            console.log('Place object:', place);
            
            if (!place) {
              console.log('No place found in event');
              return;
            }
            // Attempt to fetch needed fields to ensure we have address + location
            try {
              const p: any = place;
              if (typeof p.fetchFields === 'function') {
                await p.fetchFields({ fields: ['formattedAddress', 'location', 'id'] });
              }
            } catch {}

            // Safe field access to avoid API-version property errors
            let formattedAddress: string | undefined;
            let locAny: any;
            let pidSafe: string | undefined;
            try { formattedAddress = (place as any).formattedAddress as string | undefined; } catch {}
            try { if (!formattedAddress) formattedAddress = (place as any).displayName as string | undefined; } catch {}
            try { if (!formattedAddress) formattedAddress = (place as any).display_name as string | undefined; } catch {}
            try { locAny = (place as any).location; } catch {}
            try { pidSafe = (place as any).id || (place as any).placeId || (place as any).place_id; } catch {}

            let coordinates: google.maps.LatLngLiteral | null = null;
            if (locAny) {
              if (typeof (locAny as google.maps.LatLng).lat === 'function') {
                const ll = locAny as google.maps.LatLng;
                coordinates = { lat: ll.lat(), lng: ll.lng() };
              } else {
                coordinates = locAny as google.maps.LatLngLiteral;
              }
            }

            // Fallback: Places Details via placeId if needed
            try {
              if ((!formattedAddress || !coordinates) && pidSafe && window.google?.maps?.places?.PlacesService) {
                const details: any = await new Promise((resolve) => {
                  const svc = new google.maps.places.PlacesService(document.createElement('div'));
                  svc.getDetails(
                    { placeId: pidSafe!, fields: ['formatted_address', 'geometry', 'place_id'] },
                    (res: any, status: any) => resolve({ res, status })
                  );
                });
                if (details?.res && details.status === (google.maps.places as any).PlacesServiceStatus.OK) {
                  if (!formattedAddress) formattedAddress = details.res.formatted_address as string | undefined;
                  if (!coordinates && details.res.geometry?.location) {
                    const ll = details.res.geometry.location as google.maps.LatLng;
                    coordinates = { lat: ll.lat(), lng: ll.lng() };
                  }
                  pidSafe = details.res.place_id ?? pidSafe;
                }
              }
            } catch {}

            // Fallback: Geocode if we have an address but no coordinates
            if (formattedAddress && !coordinates) {
              try {
                const geocoded = await geocodeAddress(formattedAddress);
                if (geocoded) coordinates = geocoded;
              } catch {}
            }

            if (formattedAddress && coordinates) {
              selectionHandled = true;
              onSelect({ address: formattedAddress, coordinates, placeId: pidSafe });
            } else {
              // Last resort: read current input value and geocode
              const rawVal = (el as any)?.value ?? (el as any)?.getAttribute?.('value');
              const val = typeof rawVal === 'string' ? rawVal.trim() : '';
              if (val && val.length > 5) {
                try {
                  const coords = await geocodeAddress(val);
                  if (coords) {
                    selectionHandled = true;
                    onSelect({ address: val, coordinates: coords });
                  }
                } catch {}
              }
            }
          } catch (err) {
            console.error('PlaceAutocompleteElement: error handling selection', err);
          }
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

        // Add event listeners (use only the correct Google event)
        el.addEventListener('gmp-placeselect', selectHandler as EventListener);
        el.addEventListener('keydown', keydownHandler as unknown as EventListener);
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
