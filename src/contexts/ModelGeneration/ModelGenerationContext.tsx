
import { createContext, useContext, useState, ReactNode } from 'react';
import { ModelGenerationContextType, ModelGenerationStatus, PropertyImages } from './types';
import { useImageCapture } from './useImageCapture';
import { usePropertyAnalysis } from './useModelGeneration';

const ModelGenerationContext = createContext<ModelGenerationContextType | undefined>(undefined);

export const ModelGenerationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ModelGenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [propertyImages, setPropertyImages] = useState<PropertyImages>({
    satellite: null,
    streetView: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHomeModelVisible, setHomeModelVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [contentFromGPT, setContentFromGPT] = useState<string | null>(null);
  const [googleImages, setGoogleImages] = useState<string[]>([]);

  // Reset the generation state
  const resetGeneration = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    setCurrentTaskId(null);
    setContentFromGPT(null);
    setGoogleImages([]);
  };

  // Update progress with smooth animation - fixed type signature to match usage in hook
  const updateProgress = (newProgress: (prev: number) => number) => {
    setProgress(prev => newProgress(prev));
  };

  // Use the image capture hook with error handling
  const { capturePropertyImages } = useImageCapture(
    setStatus,
    setProgress,
    setPropertyImages,
    setErrorMessage
  );

  // Use the property analysis hook with error handling
  const { generateModel } = usePropertyAnalysis(
    setStatus,
    setProgress,
    updateProgress,
    setErrorMessage,
    propertyImages,
    setHomeModelVisible,
    setContentFromGPT,
    setGoogleImages
  );

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
        contentFromGPT,
        setContentFromGPT,
        googleImages,
        setGoogleImages
      }}
    >
      {children}
    </ModelGenerationContext.Provider>
  );
};

export const useModelGeneration = () => {
  const context = useContext(ModelGenerationContext);
  if (context === undefined) {
    console.warn('⚠️ useModelGeneration must be used within a ModelGenerationProvider');
    // Return a mock context to prevent crashes
    return {
      status: 'idle' as ModelGenerationStatus,
      setStatus: () => {},
      progress: 0,
      setProgress: () => {},
      propertyImages: { satellite: null, streetView: null },
      setPropertyImages: () => {},
      errorMessage: null,
      setErrorMessage: () => {},
      capturePropertyImages: async () => {},
      generateModel: async () => {},
      resetGeneration: () => {},
      isHomeModelVisible: false,
      setHomeModelVisible: () => {},
      updateProgress: () => {},
      currentTaskId: null,
      contentFromGPT: null,
      setContentFromGPT: () => {},
      googleImages: [],
      setGoogleImages: () => {}
    };
  }
  return context;
};
