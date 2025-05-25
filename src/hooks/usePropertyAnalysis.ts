
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResults } from '@/types/analysis';
import { getPropertyTypeFromPlaces } from '@/utils/googleMapsLoader';

interface PropertyAnalysisHook {
  isAnalyzing: boolean;
  analysisResults: AnalysisResults | null;
  error: string | null;
  analyzeProperty: (address: string, coordinates: google.maps.LatLngLiteral) => Promise<void>;
  resetAnalysis: () => void;
}

export const usePropertyAnalysis = (): PropertyAnalysisHook => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeProperty = useCallback(async (address: string, coordinates: google.maps.LatLngLiteral) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Get enhanced property type information
      const propertyType = await getPropertyTypeFromPlaces(coordinates);
      
      // Call enhanced property analysis
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-property', {
        body: {
          address,
          coordinates,
          propertyType,
          enhancedAnalysis: true
        }
      });

      if (analysisError) {
        throw new Error(analysisError.message);
      }

      if (data?.analysis) {
        // Apply property-specific logic enhancements
        const enhancedResults = enhanceAnalysisWithPropertyLogic(data.analysis, propertyType);
        setAnalysisResults(enhancedResults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    isAnalyzing,
    analysisResults,
    error,
    analyzeProperty,
    resetAnalysis
  };
};

// Enhanced analysis logic based on property type
function enhanceAnalysisWithPropertyLogic(analysis: AnalysisResults, propertyType: string): AnalysisResults {
  const enhanced = { ...analysis };

  // Apply apartment-specific logic
  if (propertyType.toLowerCase().includes('apartment') || propertyType.toLowerCase().includes('condo')) {
    // Apartments typically have no roof access
    enhanced.rooftop = {
      ...enhanced.rooftop,
      area: 0,
      solarCapacity: 0,
      revenue: 0,
      solarPotential: false
    };

    // Apartments usually have limited parking
    enhanced.parking = {
      ...enhanced.parking,
      spaces: Math.min(enhanced.parking.spaces, 1),
      revenue: enhanced.parking.spaces > 0 ? enhanced.parking.revenue : 0
    };

    // Remove pool opportunities for apartments
    enhanced.pool = {
      ...enhanced.pool,
      present: false,
      revenue: 0
    };

    // Focus on bandwidth and small storage opportunities
    enhanced.bandwidth = {
      ...enhanced.bandwidth,
      revenue: Math.max(enhanced.bandwidth.revenue, 25) // Minimum $25/month for bandwidth
    };
  }

  // Apply house-specific enhancements
  if (propertyType.toLowerCase().includes('house') || propertyType.toLowerCase().includes('residential')) {
    // Houses typically have better parking opportunities
    enhanced.parking = {
      ...enhanced.parking,
      spaces: Math.max(enhanced.parking.spaces, 2), // Minimum 2 spaces for houses
      evChargerPotential: true
    };
  }

  // Recalculate top opportunities based on enhanced data
  enhanced.topOpportunities = calculateTopOpportunities(enhanced);

  return enhanced;
}

function calculateTopOpportunities(analysis: AnalysisResults) {
  const opportunities = [];

  // Solar opportunity
  if (analysis.rooftop.revenue > 0) {
    opportunities.push({
      title: 'Solar Panel Installation',
      icon: 'sun',
      monthlyRevenue: analysis.rooftop.revenue,
      description: `Install solar panels on ${analysis.rooftop.area} sq ft roof`,
      setupCost: analysis.rooftop.setupCost || 15000,
      roi: Math.ceil((analysis.rooftop.setupCost || 15000) / analysis.rooftop.revenue),
      usingRealSolarData: analysis.rooftop.usingRealSolarData
    });
  }

  // Parking opportunity
  if (analysis.parking.revenue > 0) {
    opportunities.push({
      title: 'Parking Space Rental',
      icon: 'car',
      monthlyRevenue: analysis.parking.revenue,
      description: `Rent ${analysis.parking.spaces} parking spaces`,
      setupCost: 0,
      roi: 0
    });
  }

  // Pool opportunity
  if (analysis.pool.present && analysis.pool.revenue > 0) {
    opportunities.push({
      title: 'Pool Rental',
      icon: 'waves',
      monthlyRevenue: analysis.pool.revenue,
      description: `Rent your ${analysis.pool.type} pool by the hour`,
      setupCost: 100,
      roi: 1
    });
  }

  // Garden opportunity
  if (analysis.garden.revenue > 0) {
    opportunities.push({
      title: 'Garden Space Rental',
      icon: 'leaf',
      monthlyRevenue: analysis.garden.revenue,
      description: `${analysis.garden.opportunity} on ${analysis.garden.area} sq ft`,
      setupCost: 200,
      roi: 2
    });
  }

  // Bandwidth opportunity
  if (analysis.bandwidth.revenue > 0) {
    opportunities.push({
      title: 'Internet Bandwidth Sharing',
      icon: 'wifi',
      monthlyRevenue: analysis.bandwidth.revenue,
      description: `Share ${analysis.bandwidth.available} Mbps unused bandwidth`,
      setupCost: 0,
      roi: 0
    });
  }

  // Sort by monthly revenue and return top 5
  return opportunities
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 5);
}
