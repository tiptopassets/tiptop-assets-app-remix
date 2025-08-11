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
        if (!window.google?.maps?.places) return;

        // Create the element
        const el = new (google as any).maps.places.PlaceAutocompleteElement() as any;

        // Set attributes/options
        try { el.setAttribute('aria-label', placeholder); } catch {}
        try { el.setAttribute('placeholder', placeholder); } catch {}
        try { el.setAttribute('id', 'place-autocomplete'); } catch {}
        // Restrict to addresses for better UX
        try { el.setAttribute('types', 'address'); } catch {}

        // Listen for selection
        const selectHandler = async (e: any) => {
          try {
            const place = e?.place;
            if (!place) return;
            if (typeof place.fetchFields === 'function') {
              await place.fetchFields({ fields: ['formattedAddress', 'location', 'id'] });
            }

            const formattedAddress: string | undefined = place.formattedAddress || place.displayName || undefined;
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

        el.addEventListener('gmp-placeselect', selectHandler as EventListener);

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(el as unknown as Node);
        }

        elementRef.current = el;

        cleanup = () => {
          try {
            el.removeEventListener('gmp-placeselect', selectHandler as EventListener);
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

  return <div ref={containerRef} className={className ? className : 'w-full'} />;
};

export default PlaceAutocompleteElement;
