
import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';
import { API_KEY } from '@/utils/googleMapsLoader';

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
  currentTaskId: string | null;
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
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup event source on unmount or status change
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing EventSource connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Reset the generation state
  const resetGeneration = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    setCurrentTaskId(null);
    
    // Close any active EventSource connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // We don't reset the property images to allow for retry without recapturing
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
      if (!response.ok) throw new Error('Network response was not ok');
      
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
        imageUrlToBase64(satelliteImageUrl),
        imageUrlToBase64(streetViewImageUrl)
      ]);
      
      // Set the images in state
      setPropertyImages({
        satellite: satelliteBase64,
        streetView: streetViewBase64
      });
      
      setProgress(100);
      console.log("Successfully captured property images");
      
      // If successful, automatically move to generate model
      if (satelliteBase64) {
        // Wait a moment before moving to the next step
        setTimeout(() => {
          generateModel();
        }, 1000);
      } else {
        throw new Error("Failed to capture satellite image for 3D model generation");
      }
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
        description: "Using demo images instead. You can still generate a 3D model.",
        variant: "destructive"  // Changed 'warning' to 'destructive' to match allowed variants
      });
    }
  };

  // Poll task status using the edge function
  const pollTaskStatus = async (taskId: string) => {
    try {
      console.log("Polling task status for:", taskId);
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: { taskId },
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to check task status');
      
      console.log("Task status update:", data);
      
      // Update progress and status
      updateProgress(data.progress || progress);
      
      // If the task is completed, set the model URL
      if (data.status === 'SUCCEEDED' && data.modelUrl) {
        console.log("Model generation succeeded! URL:", data.modelUrl);
        setModelUrl(data.modelUrl);
        setStatus('completed');
        setProgress(100);
        
        toast({
          title: "3D Model Generated",
          description: "Your property model is ready to view",
        });
        return true; // Task completed
      } else if (data.status === 'FAILED' || data.status === 'CANCELED') {
        throw new Error(`Task ${data.status.toLowerCase()}: ${data.error || 'Unknown error'}`);
      }
      
      return false; // Task still in progress
    } catch (error) {
      console.error('Error polling task status:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to check task status');
      return true; // Stop polling on error
    }
  };

  // Generate 3D model using Supabase Edge Function and track progress with SSE
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
      
      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      console.log("Starting 3D model generation");
      
      // Call the Supabase Edge Function to start the 3D model generation task
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          satelliteImage: propertyImages.satellite,
          streetViewImage: propertyImages.streetView,
          outputFormat: 'glb', // Default format
          quality: 'standard', // Default quality
        },
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || 'Failed to start 3D model generation');
      }
      
      if (!data.success || !data.taskId) {
        console.error("Invalid response from edge function:", data);
        throw new Error(data.error || 'Failed to start 3D model generation task');
      }
      
      // Save the task ID for status polling
      setCurrentTaskId(data.taskId);
      console.log('Model generation task started:', data.taskId);
      
      // Set initial progress
      updateProgress(data.progress || 0);
      
      // For demo purposes, we'll use polling mechanism
      // In a production environment with proper CORS, you would use SSE to get real-time updates
      const intervalId = setInterval(async () => {
        const isCompleted = await pollTaskStatus(data.taskId);
        if (isCompleted) {
          clearInterval(intervalId);
        }
      }, 5000); // Poll every 5 seconds - increased from 2s to reduce API calls
      
      // Cleanup interval on component unmount or error
      setTimeout(() => {
        clearInterval(intervalId);
      }, 300000); // Stop polling after 5 minutes as a safety measure
      
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
