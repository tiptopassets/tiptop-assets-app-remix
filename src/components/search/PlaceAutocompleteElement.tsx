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
          const host = el as HTMLElement;
          host.style.width = '100%';
          host.style.minWidth = '0';
          host.style.background = 'transparent';
          host.style.border = 'none';
          host.style.boxShadow = 'none';
          host.style.position = 'relative';
          host.style.zIndex = '9999';
          host.style.color = 'hsl(var(--primary-foreground))';
          // Improve visibility and theming via CSS variables
          host.style.setProperty('--gmpx-color-on-surface', 'hsl(var(--primary-foreground))');
          host.style.setProperty('--gmpx-color-surface', 'hsl(var(--popover))');
          host.style.setProperty('--gmpx-color-outline', 'hsl(var(--border))');
        } catch {}

        // Listen for selection (support both event names)
        const selectHandler = async (e: any) => {
          try {
            const place = e?.place || e?.detail?.place;
            if (!place) return;
            // Attempt to fetch needed fields to ensure we have address + location
            try {
              const p: any = place;
              if (typeof p.fetchFields === 'function') {
                await p.fetchFields({ fields: ['formattedAddress', 'location', 'id'] });
              }
            } catch {}


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

            if (formattedAddress && !coordinates) {
              try {
                const geocoded = await geocodeAddress(formattedAddress);
                if (geocoded) coordinates = geocoded;
              } catch {}
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
          try { el.addEventListener(name, selectHandler as EventListener, { once: false } as any); } catch {}
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
