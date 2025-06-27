
import { useState, useEffect, useCallback } from 'react';
import { getGoogleMapsApiKey } from '@/utils/googleMapsLoader';

interface SatelliteImageResult {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

interface SatelliteImageCache {
  [address: string]: {
    imageUrl: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const imageCache: SatelliteImageCache = {};

export const useSatelliteImage = (address: string, coordinates?: { lat: number; lng: number }) => {
  const [result, setResult] = useState<SatelliteImageResult>({
    imageUrl: null,
    loading: false,
    error: null
  });

  const generateSatelliteImageUrl = useCallback(async (
    address: string, 
    coords?: { lat: number; lng: number }
  ): Promise<string> => {
    try {
      const apiKey = await getGoogleMapsApiKey();
      
      // Use coordinates if available, otherwise use address
      const location = coords 
        ? `${coords.lat},${coords.lng}` 
        : encodeURIComponent(address);
      
      // Generate high-quality satellite image URL
      const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
        `center=${location}&` +
        `zoom=20&` +
        `size=800x450&` + // 16:9 aspect ratio
        `maptype=satellite&` +
        `key=${apiKey}`;
      
      return imageUrl;
    } catch (error) {
      console.error('Error generating satellite image URL:', error);
      throw new Error('Failed to generate satellite image URL');
    }
  }, []);

  const fetchSatelliteImage = useCallback(async (
    address: string, 
    coords?: { lat: number; lng: number }
  ) => {
    if (!address.trim()) {
      setResult({ imageUrl: null, loading: false, error: null });
      return;
    }

    // Check cache first
    const cached = imageCache[address];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🖼️ Using cached satellite image for:', address);
      setResult({ imageUrl: cached.imageUrl, loading: false, error: null });
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🛰️ Fetching satellite image for:', address);
      const imageUrl = await generateSatelliteImageUrl(address, coords);
      
      // Test if image loads successfully
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Cache the successful result
      imageCache[address] = {
        imageUrl,
        timestamp: Date.now()
      };
      
      setResult({ imageUrl, loading: false, error: null });
      console.log('✅ Satellite image loaded successfully for:', address);
      
    } catch (error) {
      console.error('❌ Error fetching satellite image:', error);
      setResult({ 
        imageUrl: null, 
        loading: false, 
        error: 'Failed to load satellite image' 
      });
    }
  }, [generateSatelliteImageUrl]);

  // Auto-fetch when address or coordinates change
  useEffect(() => {
    if (address && address.trim()) {
      fetchSatelliteImage(address, coordinates);
    }
  }, [address, coordinates, fetchSatelliteImage]);

  return {
    ...result,
    refresh: () => fetchSatelliteImage(address, coordinates)
  };
};
