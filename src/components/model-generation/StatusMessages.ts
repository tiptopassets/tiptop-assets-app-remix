
import { ModelGenerationStatus } from '@/contexts/ModelGeneration';

export const statusMessages: Record<ModelGenerationStatus, string> = {
  idle: 'Ready to start',
  initializing: 'Preparing property analysis...',
  capturing: 'Capturing property images...',
  generating: 'Generating 3D model...',
  completed: '3D model generation complete!',
  error: 'Failed to generate 3D model. Please try again.'
};

export const statusDescriptions: Record<ModelGenerationStatus, string> = {
  idle: '',
  initializing: 'Setting up the analysis environment',
  capturing: 'Taking satellite and street view images of your property',
  generating: 'Creating a detailed 3D model based on property images',
  completed: 'Your property model is ready to view',
  error: 'There was a problem generating your property model'
};
