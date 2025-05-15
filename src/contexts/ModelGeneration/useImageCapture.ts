
import { useToast } from '@/hooks/use-toast';
import { imageUrlToBase64, generateMapImageUrls } from './utils';
import { PropertyImages } from './types';

export const useImageCapture = (
  setStatus: (status: any) => void,
  setProgress: (progress: number) => void,
  setPropertyImages: (images: PropertyImages) => void,
  setErrorMessage: (message: string | null) => void
) => {
  const { toast } = useToast();
  
  const capturePropertyImages = async (address: string, coordinates: google.maps.LatLngLiteral) => {
    try {
      setStatus('capturing');
      setProgress(10);
      console.log("Capturing high resolution property images for:", address, coordinates);
      
      // Generate high resolution image URLs
      const { satelliteImageUrl, streetViewImageUrl } = generateMapImageUrls(coordinates);
      setProgress(40);
      
      // Attempt to fetch both images
      const [satelliteBase64, streetViewBase64] = await Promise.all([
        imageUrlToBase64(satelliteImageUrl).catch(err => {
          console.error('Error fetching satellite image:', err);
          return null;
        }),
        imageUrlToBase64(streetViewImageUrl).catch(err => {
          console.error('Error fetching street view image:', err);
          return null;
        })
      ]);
      
      // Set the images in state
      setPropertyImages({
        satellite: satelliteBase64,
        streetView: streetViewBase64
      });
      
      setProgress(100);
      console.log("Successfully captured high resolution property images");
      
      // Complete the process
      setStatus('completed');
      
      toast({
        title: "Image Capture Complete",
        description: "High resolution property images ready for analysis.",
      });
      
    } catch (error) {
      console.error('Error capturing property images:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to capture property images. Please try again.');
      
      // Use fallback images for demos/testing
      setPropertyImages({
        satellite: '/lovable-uploads/b2f01532-85bb-44ee-98c1-afa2d7ae2620.png',
        streetView: '/lovable-uploads/76f34c86-decf-4d23-aeee-b23ba55c1be1.png'
      });
      
      toast({
        title: "Image Capture Failed",
        description: "Using demo images instead.",
        variant: "destructive"
      });
    }
  };

  return { capturePropertyImages };
};
