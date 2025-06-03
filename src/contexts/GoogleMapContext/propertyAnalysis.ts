
import { supabase } from '@/integrations/supabase/client';
import { imageUrlToBase64, generateMapImageUrls } from '@/contexts/ModelGeneration/utils';
import { AnalysisResults } from './types';
import { generateLocalMockAnalysis } from './mockAnalysisGenerator';
import { processPropertyAnalysis } from './dataFlowManager';
import { ensureCoordinates } from './coordinateService';
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
    
    // Ensure coordinates are always available using centralized service
    const coordinateResult = await ensureCoordinates(propertyAddress, addressCoordinates);
    console.log("📍 Ensured coordinates:", coordinateResult);
    
    // If using local analysis (fallback mode), generate mock data with guaranteed coordinates
    if (useLocalAnalysis) {
      setTimeout(async () => {
        const mockResults = await generateLocalMockAnalysis(propertyAddress, coordinateResult.coordinates);
        setAnalysisResults(mockResults);
        setAnalysisComplete(true);
        setIsGeneratingAnalysis(false);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Complete",
          description: `Found ${mockResults.topOpportunities.length} monetization opportunities for your property (Demo mode)`,
        });
      }, 2000);
      return;
    }
    
    // Get satellite image if we have coordinates
    let satelliteImage = null;
    if (coordinateResult.coordinates) {
      try {
        const mapUrls = await generateMapImageUrls(coordinateResult.coordinates);
        satelliteImage = await imageUrlToBase64(mapUrls.satelliteImageUrl);
        console.log("Captured satellite image for analysis");
      } catch (err) {
        console.error("Failed to capture satellite image:", err);
      }
    }
    
    // Show toast notification about processing
    toast({
      title: "Processing Property",
      description: coordinateResult.source === 'provided' 
        ? "Using precise coordinates for analysis"
        : `Using ${coordinateResult.source} coordinates (confidence: ${Math.round(coordinateResult.confidence * 100)}%)`,
    });
    
    // Call Supabase Edge Function with guaranteed coordinates
    const { data, error } = await supabase.functions.invoke('analyze-property', {
      body: { 
        address: propertyAddress,
        coordinates: coordinateResult.coordinates,
        satelliteImage: satelliteImage,
        forceLocalAnalysis: false
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
          addressCoordinates: coordinateResult.coordinates,
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
      // Process the analysis results through centralized data flow manager
      const processedResult = await processPropertyAnalysis(data.analysis, {
        address: propertyAddress,
        coordinates: coordinateResult.coordinates,
        propertyType: data.analysis.propertyType,
        useRealData: true
      });
      
      setAnalysisResults(processedResult.analysisResults);
      setAnalysisComplete(true);
      
      // Show toast with validation summary
      const validationSummary = processedResult.validationLog.join(', ');
      toast({
        title: "Analysis Complete",
        description: `Found ${processedResult.analysisResults.topOpportunities.length} opportunities. ${validationSummary}`,
      });
    } else {
      throw new Error("No analysis data received");
    }
    
  } catch (error) {
    console.error("Error generating property analysis:", error);
    
    // If we encounter any API error, fall back to local analysis with guaranteed coordinates
    if (error instanceof Error && 
        (error.message.includes('OpenAI') || 
         error.message.includes('quota') || 
         error.message.includes('insufficient_quota') ||
         error.message.includes('geocode') ||
         error.message.includes('coordinates'))) {
      
      console.log("API error, switching to fallback mode with guaranteed coordinates");
      setUseLocalAnalysis(true);
      toast({
        title: "API Connection Issue",
        description: "Switching to demo mode with market-based estimates.",
      });
      
      // Try again with local analysis and guaranteed coordinates
      const coordinateResult = await ensureCoordinates(propertyAddress, addressCoordinates);
      return generatePropertyAnalysis({
        propertyAddress,
        addressCoordinates: coordinateResult.coordinates,
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
    
    setAnalysisError("We couldn't analyze this property. Please try again later or switch to manual mode.");
    setAnalysisComplete(false);
    
    toast({
      title: "Analysis Failed",
      description: "We couldn't analyze this property automatically. Try manual entry mode.",
      variant: "destructive"
    });
  } finally {
    if (!useLocalAnalysis) {
      setIsGeneratingAnalysis(false);
      setIsAnalyzing(false);
    }
  }
};
