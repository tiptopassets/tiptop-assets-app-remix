
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

export type ModelGenerationStatus = 'idle' | 'initializing' | 'capturing' | 'generating' | 'completed' | 'error';

interface ModelGenerationContextType {
  status: ModelGenerationStatus;
  setStatus: (status: ModelGenerationStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
  modelUrl: string | null;
  setModelUrl: (url: string | null) => void;
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
}

const ModelGenerationContext = createContext<ModelGenerationContextType | undefined>(undefined);

export const ModelGenerationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ModelGenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [propertyImages, setPropertyImages] = useState<{
    satellite: string | null;
    streetView: string | null;
  }>({
    satellite: null,
    streetView: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHomeModelVisible, setHomeModelVisible] = useState(false);

  // Reset the generation state
  const resetGeneration = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    // We don't reset the property images to allow for retry without recapturing
  };

  // Update progress with smooth animation
  const updateProgress = (newProgress: number) => {
    setProgress(prev => {
      if (newProgress <= prev) return prev;
      return newProgress;
    });
  };

  // Capture property images using Google Maps Static API and Street View API
  const capturePropertyImages = async (address: string, coordinates: google.maps.LatLngLiteral) => {
    try {
      setStatus('capturing');
      setProgress(10);
      
      // In a real implementation, this would make API calls to get the images
      // For now, we'll simulate the image capture with a timeout
      
      // Simulate satellite image capture
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProgress(40);
      
      // Use Google Maps Static API (this would be an actual API call in production)
      const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=19&size=800x800&maptype=satellite&key=YOUR_API_KEY`;
      
      // Simulate street view image capture
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProgress(70);
      
      // Use Google Street View API (this would be an actual API call in production)
      const streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${coordinates.lat},${coordinates.lng}&key=YOUR_API_KEY`;
      
      // For demo purposes, we'll use placeholder images
      setPropertyImages({
        satellite: '/lovable-uploads/b2f01532-85bb-44ee-98c1-afa2d7ae2620.png', // Replace with actual satellite image
        streetView: '/lovable-uploads/76f34c86-decf-4d23-aeee-b23ba55c1be1.png', // Replace with actual street view image
      });
      
      setProgress(100);
    } catch (error) {
      console.error('Error capturing property images:', error);
      setStatus('error');
      setErrorMessage('Failed to capture property images. Please try again.');
    }
  };

  // Generate 3D model using Supabase Edge Function
  const generateModel = async () => {
    try {
      if (!propertyImages.satellite) {
        setStatus('error');
        setErrorMessage('No satellite image available for 3D model generation');
        toast({
          title: "3D Model Generation Failed",
          description: "No satellite image available for 3D model generation",
          variant: "destructive",
        });
        return;
      }
      
      setStatus('generating');
      setProgress(0);
      setErrorMessage(null);
      setHomeModelVisible(true);
      
      // Call the Supabase Edge Function to generate the 3D model
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          satelliteImage: propertyImages.satellite,
          streetViewImage: propertyImages.streetView,
        },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate 3D model');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate 3D model');
      }
      
      // Update progress during the process
      for (let i = 0; i <= 100; i += 10) {
        updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200)); // Shorter delay for demo
      }
      
      // Set the model URL from the response
      setModelUrl(data.modelUrl);
      setStatus('completed');
      
    } catch (error) {
      console.error('Error generating 3D model:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate 3D model. Please try again.');
      toast({
        title: "3D Model Generation Failed",
        description: error instanceof Error ? error.message : "There was a problem generating your property model",
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
        modelUrl,
        setModelUrl,
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
