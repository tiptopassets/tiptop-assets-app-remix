
import { API_KEY } from '@/utils/googleMapsLoader';

// Helper function to convert image URL to base64
export const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image from ${url}. Status: ${response.status}`);
      return null;
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    return null;
  }
};

// Generate URLs for Google Maps Static API images
export const generateMapImageUrls = (coordinates: google.maps.LatLngLiteral) => {
  return {
    satelliteImageUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=19&size=800x800&maptype=satellite&key=${API_KEY}`,
    streetViewImageUrl: `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${coordinates.lat},${coordinates.lng}&key=${API_KEY}`
  };
};
