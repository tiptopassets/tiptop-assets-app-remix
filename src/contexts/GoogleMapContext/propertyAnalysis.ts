
import { supabase } from '@/integrations/supabase/client';
import { imageUrlToBase64, generateMapImageUrls } from '@/contexts/ModelGeneration/utils';
import { AnalysisResults } from './types';
import { generateLocalMockAnalysis } from './mockAnalysisGenerator';
import { toast } from '@/hooks/use-toast';

interface AnalysisParams {
  propertyAddress: string;
  addressCoordinates: google.maps.LatLngLiteral | null;
  useLocalAnalysis: boolean;
  setIsGeneratingAnalysis: (value: boolean) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  setAnalysisComplete: (value: boolean) => void;
  setUseLocalAnalysis: (value: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  toast: typeof toast;
}

export const generatePropertyAnalysis = async ({
  propertyAddress,
  addressCoordinates,
  useLocalAnalysis,
  setIsGeneratingAnalysis,
  setIsAnalyzing,
  setAnalysisResults,
  setAnalysisComplete,
  setUseLocalAnalysis,
  setAnalysisError,
  toast
}: AnalysisParams): Promise<void> => {
  if (!propertyAddress) {
    toast({
      title: "Address Required",
      description: "Please enter a property address to analyze",
      variant: "destructive"
    });
    return;
  }

  try {
    // Reset error state when starting a new analysis
    setAnalysisError(null);
    setIsGeneratingAnalysis(true);
    setIsAnalyzing(true);
    
    // If using local analysis (fallback mode), generate mock data
    if (useLocalAnalysis) {
      setTimeout(() => {
        const mockResults = generateLocalMockAnalysis(propertyAddress);
        setAnalysisResults(mockResults);
        setAnalysisComplete(true);
        setIsGeneratingAnalysis(false);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Complete",
          description: `Found ${mockResults.topOpportunities.length} monetization opportunities for your property (Demo mode)`,
        });
      }, 2000); // Simulate a delay
      return;
    }
    
    // Get satellite image if we have coordinates
    let satelliteImage = null;
    if (addressCoordinates) {
      try {
        const { satelliteImageUrl } = generateMapImageUrls(addressCoordinates);
        satelliteImage = await imageUrlToBase64(satelliteImageUrl);
        console.log("Captured satellite image for analysis");
      } catch (err) {
        console.error("Failed to capture satellite image:", err);
      }
    }
    
    // Show toast notification about image analysis
    if (satelliteImage) {
      toast({
        title: "Processing Images",
        description: "Using AI to analyze satellite imagery for your property",
      });
    }
    
    // Call Supabase Edge Function to generate property analysis with GPT
    const { data, error } = await supabase.functions.invoke('analyze-property', {
      body: { 
        address: propertyAddress,
        coordinates: addressCoordinates,
        satelliteImage: satelliteImage
      }
    });
    
    if (error) {
      // Check if it's a quota error
      if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
        console.log("API quota exceeded, switching to fallback mode");
        setUseLocalAnalysis(true);
        toast({
          title: "API Quota Exceeded",
          description: "Using fallback mode for analysis. Results will be approximate.",
        });
        // Retry with local analysis
        return generatePropertyAnalysis({
          propertyAddress,
          addressCoordinates,
          useLocalAnalysis: true,
          setIsGeneratingAnalysis,
          setIsAnalyzing,
          setAnalysisResults,
          setAnalysisComplete,
          setUseLocalAnalysis,
          setAnalysisError,
          toast
        });
      }
      throw new Error(error.message);
    }
    
    if (data && data.analysis) {
      // Set the analysis results from GPT
      setAnalysisResults(data.analysis);
      setAnalysisComplete(true);
      
      // Show toast with insight summary
      toast({
        title: "Analysis Complete",
        description: `Found ${data.analysis.topOpportunities.length} monetization opportunities for your property`,
      });
    } else {
      throw new Error("No analysis data received");
    }
    
  } catch (error) {
    console.error("Error generating property analysis:", error);
    
    // If we encounter an OpenAI API error, fall back to local analysis
    if (error instanceof Error && 
        (error.message.includes('OpenAI') || 
         error.message.includes('quota') || 
         error.message.includes('insufficient_quota'))) {
      
      console.log("OpenAI API error, switching to fallback mode");
      setUseLocalAnalysis(true);
      toast({
        title: "API Connection Issue",
        description: "Switching to demo mode. Results will be approximate.",
      });
      
      // Try again with local analysis
      return generatePropertyAnalysis({
        propertyAddress,
        addressCoordinates,
        useLocalAnalysis: true,
        setIsGeneratingAnalysis,
        setIsAnalyzing,
        setAnalysisResults,
        setAnalysisComplete,
        setUseLocalAnalysis,
        setAnalysisError,
        toast
      });
    }
    
    setAnalysisError("We couldn't analyze this property. Please try again later.");
    setAnalysisComplete(false);
    
    toast({
      title: "Analysis Failed",
      description: "We couldn't analyze this property. Please try again later.",
      variant: "destructive"
    });
  } finally {
    if (!useLocalAnalysis) {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
    }
  }
};
