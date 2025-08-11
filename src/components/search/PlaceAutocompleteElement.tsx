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
          host.style.color = 'hsl(var(--foreground))';
          // Improve visibility and theming via CSS variables
          host.style.setProperty('--gmpx-color-on-surface', 'hsl(var(--foreground))');
          host.style.setProperty('--gmpx-color-surface', 'hsl(var(--popover))');
          host.style.setProperty('--gmpx-color-outline', 'hsl(var(--border))');
        } catch {}

        // Listen for selection (support both event names)
        let selectionHandled = false;
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

        const evNames = ['gmp-placeselect', 'gmpx-placeselect'];
        evNames.forEach((name) => {
          try { el.addEventListener(name, selectHandler as EventListener, { once: false } as any); } catch {}
        });
        try { el.addEventListener('keydown', keydownHandler as unknown as EventListener); } catch {}

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
            try { (el as any).removeEventListener?.('keydown', keydownHandler as unknown as EventListener); } catch {}
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
