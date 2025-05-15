
export type ModelGenerationStatus = 'idle' | 'capturing' | 'generating' | 'completed' | 'error';

export interface PropertyImages {
  satellite: string | null;
  streetView: string | null;
}

export interface ModelGenerationContextType {
  status: ModelGenerationStatus;
  setStatus: (status: ModelGenerationStatus) => void;
  progress: number;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  updateProgress: (newProgress: (prev: number) => number) => void;
  propertyImages: PropertyImages;
  setPropertyImages: (images: PropertyImages) => void;
  errorMessage: string | null;
  setErrorMessage: (error: string | null) => void;
  capturePropertyImages: (address: string, coordinates: google.maps.LatLngLiteral) => Promise<void>;
  generateModel: () => Promise<void>;
  resetGeneration: () => void;
  isHomeModelVisible: boolean;
  setHomeModelVisible: (visible: boolean) => void;
  currentTaskId: string | null;
  contentFromGPT: string | null;
  setContentFromGPT: (content: string | null) => void;
  googleImages: string[];
  setGoogleImages: (images: string[]) => void;
}
