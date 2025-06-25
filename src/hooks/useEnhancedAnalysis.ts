
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';

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
  const { refreshUserData } = useUserData();

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
      console.log('🔍 Starting enhanced property analysis:', { address, userId: user.id });
      
      const { data, error } = await supabase.functions.invoke('enhanced-property-analysis', {
        body: {
          address,
          userId: user.id
        }
      });

      if (error) {
        console.error('❌ Enhanced analysis error:', error);
        throw error;
      }

      if (data.success) {
        console.log('✅ Enhanced analysis completed:', data);
        setAnalysisResult(data);
        
        // Refresh user data to update dashboard with new analysis
        try {
          await refreshUserData();
          console.log('🔄 Dashboard data refreshed after enhanced analysis');
        } catch (refreshError) {
          console.error('⚠️ Failed to refresh dashboard data:', refreshError);
        }
        
        toast({
          title: "Analysis Complete",
          description: `Property analysis completed with ${Math.round(data.dataQuality.accuracyScore * 100)}% accuracy and saved to dashboard`
        });
        return data;
      } else {
        throw new Error(data.error || 'Enhanced analysis failed');
      }
    } catch (error) {
      console.error('❌ Enhanced analysis error:', error);
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
