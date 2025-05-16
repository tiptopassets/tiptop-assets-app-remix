
import { ModelGenerationStatus } from '@/contexts/ModelGeneration/types';

// Define the messages for each status
export const statusMessages: Record<ModelGenerationStatus, string> = {
  idle: 'Ready to analyze property',
  initializing: 'Initializing property analysis...',
  capturing: 'Capturing satellite imagery...',
  generating: 'Generating property analysis...',
  completed: 'Analysis complete! Explore your property\'s potential.',
  error: 'An error occurred during analysis.',
};

// Define the sub-messages for each status
export const statusSubMessages: Record<ModelGenerationStatus, string> = {
  idle: 'Enter an address to begin.',
  initializing: 'Preparing to analyze your property...',
  capturing: 'Capturing high-resolution images of your property...',
  generating: 'Our AI is analyzing your property\'s monetization potential...',
  completed: 'We found several ways you can monetize your property!',
  error: 'Please try again or contact support if the problem persists.',
};
