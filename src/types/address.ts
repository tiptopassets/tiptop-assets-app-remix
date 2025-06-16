
export interface Address {
  id?: string;
  address: string;
  formatted_address?: string;
  coordinates?: google.maps.LatLngLiteral;
  place_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddressSearchResult {
  address: string;
  formatted_address: string;
  coordinates: google.maps.LatLngLiteral;
  place_id: string;
}
