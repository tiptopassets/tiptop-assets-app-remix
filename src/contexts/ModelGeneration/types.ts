
export type ModelGenerationStatus = 'idle' | 'initializing' | 'capturing' | 'generating' | 'completed' | 'error';

export interface PropertyImages {
  satellite: string | null;
  streetView: string | null;
}

export interface ModelGenerationContextType {
  status: ModelGenerationStatus;
  setStatus: (status: ModelGenerationStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
  propertyImages: PropertyImages;
  setPropertyImages: (images: PropertyImages) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  capturePropertyImages: (address: string, coordinates: google.maps.LatLngLiteral) => Promise<void>;
  generateModel: () => Promise<void>;
  resetGeneration: () => void;
  isHomeModelVisible: boolean;
  setHomeModelVisible: (visible: boolean) => void;
  updateProgress: (newProgress: (prev: number) => number) => void;
  currentTaskId: string | null;
}
