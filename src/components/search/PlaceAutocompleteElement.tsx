import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

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

        // Create the element
        const el = new (google as any).maps.places.PlaceAutocompleteElement() as any;

        // Set attributes/options
        try { el.setAttribute('aria-label', placeholder); } catch {}
        try { el.setAttribute('placeholder', placeholder); } catch {}
        try { el.setAttribute('id', 'place-autocomplete'); } catch {}
        // Restrict to addresses for better UX (best-effort)
        // Some versions may not support setting types; keep it best-effort and silent
        try { el.setAttribute('types', 'address'); } catch {}

        // Make it blend with our UI container
        try {
          (el as HTMLElement).style.width = '100%';
          (el as HTMLElement).style.minWidth = '0';
          (el as HTMLElement).style.background = 'transparent';
          (el as HTMLElement).style.border = 'none';
          (el as HTMLElement).style.boxShadow = 'none';
        } catch {}

        // Listen for selection (support both event names)
        const selectHandler = async (e: any) => {
          try {
            const place = e?.place || e?.detail?.place;
            if (!place) return;
            // Avoid fetchFields to prevent version errors; rely on defaults
            // if (typeof place.fetchFields === 'function') {
            //   await place.fetchFields({ fields: ['formattedAddress', 'location', 'id', 'displayName'] });
            // }

            const formattedAddress: string | undefined = place.formattedAddress || place.displayName || place.display_name || undefined;
            const loc = place.location as google.maps.LatLng | google.maps.LatLngLiteral | null | undefined;

            let coordinates: google.maps.LatLngLiteral | null = null;
            if (loc) {
              if (typeof (loc as google.maps.LatLng).lat === 'function') {
                const ll = loc as google.maps.LatLng;
                coordinates = { lat: ll.lat(), lng: ll.lng() };
              } else {
                coordinates = loc as google.maps.LatLngLiteral;
              }
            }

            if (formattedAddress && coordinates) {
              onSelect({ address: formattedAddress, coordinates, placeId: place.id });
            }
          } catch (err) {
            console.error('PlaceAutocompleteElement: error handling selection', err);
          }
        };

        const evNames = ['gmp-placeselect', 'gmpx-placeselect'];
        evNames.forEach((name) => {
          try { el.addEventListener(name, selectHandler as EventListener); } catch {}
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(el as unknown as Node);
        }

        elementRef.current = el;

        cleanup = () => {
          try {
            const evs = ['gmp-placeselect', 'gmpx-placeselect'];
            evs.forEach((name) => {
              try { (el as any).removeEventListener?.(name, selectHandler as unknown as EventListener); } catch {}
            });
          } catch {}
          try {
            if (containerRef.current && (el as any).parentElement === containerRef.current) {
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

  return <div ref={containerRef} className={className ? className : 'w-full'} />;
};

export default PlaceAutocompleteElement;
