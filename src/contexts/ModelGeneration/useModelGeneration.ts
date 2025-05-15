
import { useToast } from '@/hooks/use-toast';
import { PropertyImages } from './types';

export const usePropertyAnalysis = (
  setStatus: (status: any) => void,
  setProgress: (progress: number) => void,
  updateProgress: (newProgress: number) => void,
  setErrorMessage: (message: string | null) => void,
  propertyImages: PropertyImages,
  setHomeModelVisible: (visible: boolean) => void
) => {
  const { toast } = useToast();
  
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

  return { generateModel };
};
