
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedAnalysisResult {
  analysisId: string;
  results: any;
  images: {
    satellite: string;
    streetView: string;
  };
  dataQuality: {
    hasGoogleSolar: boolean;
    accuracyScore: number;
  };
}

export const useEnhancedAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzeProperty = async (address: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to analyze properties",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-property-analysis', {
        body: {
          address,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisResult(data);
        toast({
          title: "Analysis Complete",
          description: `Property analysis completed with ${Math.round(data.dataQuality.accuracyScore * 100)}% accuracy`
        });
        return data;
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Enhanced analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze property",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeProperty,
    isLoading,
    analysisResult,
    setAnalysisResult
  };
};
