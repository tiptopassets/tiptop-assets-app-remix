
import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_KEY } from '@/utils/googleMapsLoader';

export type ModelGenerationStatus = 'idle' | 'initializing' | 'capturing' | 'generating' | 'completed' | 'error';

interface ModelGenerationContextType {
  status: ModelGenerationStatus;
  setStatus: (status: ModelGenerationStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
  propertyImages: {
    satellite: string | null;
    streetView: string | null;
  };
  setPropertyImages: (images: { satellite: string | null; streetView: string | null }) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  capturePropertyImages: (address: string, coordinates: google.maps.LatLngLiteral) => Promise<void>;
  generateModel: () => Promise<void>;
  resetGeneration: () => void;
  isHomeModelVisible: boolean;
  setHomeModelVisible: (visible: boolean) => void;
  updateProgress: (newProgress: number) => void;
  currentTaskId: string | null;
}

const ModelGenerationContext = createContext<ModelGenerationContextType | undefined>(undefined);

export const ModelGenerationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ModelGenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [propertyImages, setPropertyImages] = useState<{
    satellite: string | null;
    streetView: string | null;
  }>({
    satellite: null,
    streetView: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHomeModelVisible, setHomeModelVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset the generation state
  const resetGeneration = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    setCurrentTaskId(null);
  };

  // Update progress with smooth animation
  const updateProgress = (newProgress: number) => {
    setProgress(prev => {
      if (newProgress <= prev) return prev;
      return newProgress;
    });
  };

  // Helper function to convert image URL to base64
  const imageUrlToBase64 = async (url: string): Promise<string | null> => {
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

  // Capture property images using Google Maps Static API and Street View API
  const capturePropertyImages = async (address: string, coordinates: google.maps.LatLngLiteral) => {
    try {
      setStatus('capturing');
      setProgress(10);
      console.log("Capturing property images for:", address, coordinates);
      
      // Use Google Maps Static API for satellite image
      const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=19&size=800x800&maptype=satellite&key=${API_KEY}`;
      setProgress(40);
      
      // Use Google Street View API for street view image
      const streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${coordinates.lat},${coordinates.lng}&key=${API_KEY}`;
      
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
      console.log("Successfully captured property images");
      
      // Complete the process (no model generation)
      setStatus('completed');
      
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

  // Modified to simply complete the process
  const generateModel = async () => {
    try {
      if (!propertyImages.satellite) {
        setStatus('error');
        setErrorMessage('No satellite image available for property analysis');
        toast({
          title: "Property Analysis Failed",
          description: "No satellite image available for analysis",
          variant: "destructive",
        });
        return;
      }
      
      setStatus('generating');
      setProgress(0);
      setErrorMessage(null);
      setHomeModelVisible(true);
      
      // Simulate progress
      const interval = setInterval(() => {
        updateProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Complete after a short delay
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setStatus('completed');
        toast({
          title: "Property Analysis Complete", 
          description: "View your property's monetization opportunities below"
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error during property analysis:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze property. Please try again.');
      
      toast({
        title: "Property Analysis Failed",
        description: error instanceof Error ? error.message : "There was a problem analyzing your property",
        variant: "destructive",
      });
    }
  };

  return (
    <ModelGenerationContext.Provider
      value={{
        status,
        setStatus,
        progress,
        setProgress,
        propertyImages,
        setPropertyImages,
        errorMessage,
        setErrorMessage,
        capturePropertyImages,
        generateModel,
        resetGeneration,
        isHomeModelVisible,
        setHomeModelVisible,
        updateProgress,
        currentTaskId,
      }}
    >
      {children}
    </ModelGenerationContext.Provider>
  );
};

export const useModelGeneration = () => {
  const context = useContext(ModelGenerationContext);
  if (context === undefined) {
    throw new Error('useModelGeneration must be used within a ModelGenerationProvider');
  }
  return context;
};
