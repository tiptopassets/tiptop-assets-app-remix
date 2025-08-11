// Minimal type shims for the new Places Autocomplete Element
// These augmentations are intentionally lightweight to avoid conflicts

declare namespace google.maps.places {
  // Simplified Place type used by the element
  // The real API has richer typing; we only declare what we need
  interface ElementPlace {
    fetchFields(options: { fields: string[] }): Promise<void>;
    formattedAddress?: string;
    location?: google.maps.LatLng | google.maps.LatLngLiteral | null;
    id?: string;
  }

  // The custom element class
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PlaceAutocompleteElement extends HTMLElement {}
}

// Event type for the 'gmp-placeselect' event
interface PlaceSelectEvent extends Event {
  // Google’s web component sets `place` on the event object
  // We keep it as any to be resilient to API evolutions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  place: any;
}
