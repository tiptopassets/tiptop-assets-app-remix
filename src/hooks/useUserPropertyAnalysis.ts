
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { AnalysisResults } from '@/types/analysis';

export interface PropertyAnalysisData {
  analysisId: string;
  address: string;
  analysisResults: AnalysisResults;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  availableAssets: AssetInfo[];
}

export interface AssetInfo {
  type: string;
  name: string;
  monthlyRevenue: number;
  area?: string;
  isConfigured: boolean;
  hasRevenuePotential: boolean;
}

export const useUserPropertyAnalysis = (analysisId?: string) => {
  const { user } = useAuth();
  const { analyses, assetSelections, getPrimaryAddress, loading } = useUserData();
  const [propertyData, setPropertyData] = useState<PropertyAnalysisData | null>(null);

  useEffect(() => {
    if (!user || loading || analyses.length === 0) {
      setPropertyData(null);
      return;
    }

    console.log('🔍 [PROPERTY ANALYSIS] Processing analysis data:', {
      requestedAnalysisId: analysisId,
      availableAnalyses: analyses.length,
      analysisIds: analyses.map(a => a.id)
    });

    // Find specific analysis by ID or use the latest one
    const targetAnalysis = analysisId 
      ? analyses.find(analysis => analysis.id === analysisId)
      : analyses[0];

    if (!targetAnalysis) {
      console.warn('⚠️ [PROPERTY ANALYSIS] No matching analysis found:', {
        requestedId: analysisId,
        availableIds: analyses.map(a => a.id)
      });
      setPropertyData(null);
      return;
    }

    console.log('✅ [PROPERTY ANALYSIS] Using analysis:', {
      analysisId: targetAnalysis.id,
      addressId: targetAnalysis.address_id,
      totalRevenue: targetAnalysis.total_monthly_revenue,
      totalOpportunities: targetAnalysis.total_opportunities
    });

    // Get address from the analysis context, not primary address
    const analysisAddress = getAddressFromAnalysis(targetAnalysis);
    
    // Map analysis results to asset info with proper filtering
    const availableAssets: AssetInfo[] = [];
    
    // Only include assets with actual revenue potential
    const analysisResults = targetAnalysis.analysis_results;
    
    // Rooftop Solar - only if has revenue
    if (analysisResults.rooftop?.revenue > 0) {
      availableAssets.push({
        type: 'rooftop',
        name: 'Solar Panels',
        monthlyRevenue: analysisResults.rooftop.revenue,
        area: `${analysisResults.rooftop.area} sq ft`,
        isConfigured: assetSelections.some(s => 
          s.analysis_id === targetAnalysis.id && s.asset_type.toLowerCase().includes('rooftop')
        ),
        hasRevenuePotential: true
      });
    }

    // Parking - only if has spaces and revenue
    if (analysisResults.parking?.spaces > 0 && analysisResults.parking?.revenue > 0) {
      availableAssets.push({
        type: 'parking',
        name: 'Parking Spaces',
        monthlyRevenue: analysisResults.parking.revenue,
        area: `${analysisResults.parking.spaces} spaces`,
        isConfigured: assetSelections.some(s => 
          s.analysis_id === targetAnalysis.id && s.asset_type.toLowerCase().includes('parking')
        ),
        hasRevenuePotential: true
      });
    }

    // Pool - only if present and has revenue
    if (analysisResults.pool?.present && analysisResults.pool?.revenue > 0) {
      availableAssets.push({
        type: 'pool',
        name: 'Swimming Pool',
        monthlyRevenue: analysisResults.pool.revenue,
        area: `${analysisResults.pool.area} sq ft`,
        isConfigured: assetSelections.some(s => 
          s.analysis_id === targetAnalysis.id && s.asset_type.toLowerCase().includes('pool')
        ),
        hasRevenuePotential: true
      });
    }

    // Garden - only if has area and revenue
    if (analysisResults.garden?.area > 0 && analysisResults.garden?.revenue > 0) {
      availableAssets.push({
        type: 'garden',
        name: 'Garden Space',
        monthlyRevenue: analysisResults.garden.revenue,
        area: `${analysisResults.garden.area} sq ft`,
        isConfigured: assetSelections.some(s => 
          s.analysis_id === targetAnalysis.id && s.asset_type.toLowerCase().includes('garden')
        ),
        hasRevenuePotential: true
      });
    }

    // Bandwidth - only if has revenue
    if (analysisResults.bandwidth?.revenue > 0) {
      availableAssets.push({
        type: 'bandwidth',
        name: 'Internet Bandwidth',
        monthlyRevenue: analysisResults.bandwidth.revenue,
        area: `${analysisResults.bandwidth.available} Mbps`,
        isConfigured: assetSelections.some(s => 
          s.analysis_id === targetAnalysis.id && s.asset_type.toLowerCase().includes('bandwidth')
        ),
        hasRevenuePotential: true
      });
    }

    // Storage - only if has revenue
    if (analysisResults.storage?.revenue > 0) {
      availableAssets.push({
        type: 'storage',
        name: 'Storage Space',
        monthlyRevenue: analysisResults.storage.revenue,
        isConfigured: assetSelections.some(s => 
          s.analysis_id === targetAnalysis.id && s.asset_type.toLowerCase().includes('storage')
        ),
        hasRevenuePotential: true
      });
    }

    // Sort by actual revenue potential (highest first)
    availableAssets.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    console.log('📊 [PROPERTY ANALYSIS] Final asset data:', {
      totalAssets: availableAssets.length,
      assets: availableAssets.map(a => ({
        type: a.type,
        name: a.name,
        revenue: a.monthlyRevenue,
        configured: a.isConfigured
      }))
    });

    setPropertyData({
      analysisId: targetAnalysis.id,
      address: analysisAddress,
      analysisResults: targetAnalysis.analysis_results,
      totalMonthlyRevenue: targetAnalysis.total_monthly_revenue,
      totalOpportunities: targetAnalysis.total_opportunities,
      availableAssets
    });

  }, [user, analyses, assetSelections, loading, analysisId]);

  const getAddressFromAnalysis = (analysis: any): string => {
    // Try to get address from analysis context first
    if (analysis.analysis_results?.address) {
      return analysis.analysis_results.address;
    }
    
    // Fallback to property address from journey data
    if (analysis.property_address) {
      return analysis.property_address;
    }
    
    // Last resort: use primary address
    const primaryAddress = getPrimaryAddress();
    return primaryAddress?.address || 'Property Address';
  };

  return {
    propertyData,
    loading,
    hasPropertyData: !!propertyData
  };
};
