
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
      // Get property type information
      const propertyType = await getPropertyTypeFromPlaces(coordinates);
      
      // Call unified property analysis
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-property', {
        body: {
          address,
          coordinates,
          propertyType
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

// Property-specific analysis logic based on property type
function enhanceAnalysisWithPropertyLogic(analysis: AnalysisResults, propertyType: string): AnalysisResults {
  const enhanced = { ...analysis };

  // Apply apartment-specific logic
  if (propertyType.toLowerCase().includes('apartment') || 
      propertyType.toLowerCase().includes('condo') ||
      analysis.propertyType === 'apartment') {
    
    console.log('🏢 Applying apartment-specific enhancements');
    
    // Apartments typically have no roof access
    enhanced.rooftop = {
      ...enhanced.rooftop,
      area: 0,
      solarCapacity: 0,
      revenue: 0,
      solarPotential: false
    };

    // Apartments usually have limited parking control
    enhanced.parking = {
      ...enhanced.parking,
      spaces: 0,
      revenue: 0
    };

    // Remove pool opportunities for apartments (shared amenity)
    enhanced.pool = {
      ...enhanced.pool,
      present: false,
      revenue: 0
    };

    // Remove garden opportunities (no individual access)
    enhanced.garden = {
      ...enhanced.garden,
      area: 0,
      revenue: 0,
      opportunity: 'None'
    };

    // Focus on bandwidth and small storage opportunities
    enhanced.bandwidth = {
      ...enhanced.bandwidth,
      revenue: Math.max(enhanced.bandwidth.revenue, 25) // Minimum $25/month for bandwidth
    };

    // Limit storage to personal unit storage
    enhanced.storage = {
      ...enhanced.storage,
      revenue: Math.min(enhanced.storage.revenue, 15) // Max $15/month for unit storage
    };

    // Ensure apartment-specific opportunities are in topOpportunities
    enhanced.topOpportunities = generateApartmentOpportunities(enhanced);
  }

  // Apply house-specific enhancements
  if (propertyType.toLowerCase().includes('house') || 
      propertyType.toLowerCase().includes('residential') ||
      analysis.propertyType === 'single_family') {
    
    // Houses typically have better parking opportunities
    enhanced.parking = {
      ...enhanced.parking,
      spaces: Math.max(enhanced.parking.spaces, 2), // Minimum 2 spaces for houses
      evChargerPotential: true
    };
  }

  return enhanced;
}

function generateApartmentOpportunities(analysis: AnalysisResults) {
  const opportunities = [];

  // Internet bandwidth sharing - primary opportunity for apartments
  if (analysis.bandwidth.revenue > 0) {
    opportunities.push({
      title: 'Internet Bandwidth Sharing',
      icon: 'wifi',
      monthlyRevenue: analysis.bandwidth.revenue,
      description: `Share ${analysis.bandwidth.available} GB unused bandwidth for passive income`,
      setupCost: 0,
      roi: 0
    });
  }

  // Personal storage rental - secondary opportunity
  if (analysis.storage.revenue > 0) {
    opportunities.push({
      title: 'Personal Storage Rental',
      icon: 'storage',
      monthlyRevenue: analysis.storage.revenue,
      description: `Rent out personal storage space within your unit`,
      setupCost: 0,
      roi: 0
    });
  }

  // Add a note about building restrictions
  opportunities.push({
    title: 'Building Type Notice',
    icon: 'info',
    monthlyRevenue: 0,
    description: 'As an apartment/condo resident, your monetization options are limited to unit-level opportunities due to building restrictions and shared amenities.',
    setupCost: 0,
    roi: 0
  });

  return opportunities;
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
      description: `Share ${analysis.bandwidth.available} GB unused bandwidth`,
      setupCost: 0,
      roi: 0
    });
  }

  // Storage opportunity
  if (analysis.storage.revenue > 0) {
    opportunities.push({
      title: 'Storage Space Rental',
      icon: 'storage',
      monthlyRevenue: analysis.storage.revenue,
      description: `Rent out storage space for extra income`,
      setupCost: 100,
      roi: Math.ceil(100 / analysis.storage.revenue)
    });
  }

  // Sort by monthly revenue and return top 5
  return opportunities
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 5);
}
