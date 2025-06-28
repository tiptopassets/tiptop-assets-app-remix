
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { AnalysisResults } from '@/types/analysis';

export interface PropertyAnalysisData {
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

interface UseUserPropertyAnalysisParams {
  analysisId?: string;
  addressId?: string;
  forceRefresh?: boolean;
}

export const useUserPropertyAnalysis = (params?: UseUserPropertyAnalysisParams) => {
  const { user } = useAuth();
  const { analyses, assetSelections, getPrimaryAddress, loading } = useUserData();
  const [propertyData, setPropertyData] = useState<PropertyAnalysisData | null>(null);

  useEffect(() => {
    if (!user || loading || analyses.length === 0) {
      setPropertyData(null);
      return;
    }

    // Find the specific analysis if analysisId or addressId is provided
    let targetAnalysis = analyses[0]; // Default to latest
    
    if (params?.analysisId) {
      const foundAnalysis = analyses.find(a => a.id === params.analysisId);
      if (foundAnalysis) targetAnalysis = foundAnalysis;
    } else if (params?.addressId) {
      const foundAnalysis = analyses.find(a => a.address_id === params.addressId);
      if (foundAnalysis) targetAnalysis = foundAnalysis;
    }

    console.log('🎯 [PROPERTY ANALYSIS] Using analysis:', {
      analysisId: targetAnalysis.id,
      addressId: targetAnalysis.address_id,
      totalRevenue: targetAnalysis.total_monthly_revenue,
      totalOpportunities: targetAnalysis.total_opportunities
    });

    // Get the corresponding address for this analysis
    const primaryAddress = getPrimaryAddress()?.address || 'Your Property';
    
    // Map analysis results to asset info based on actual analysis data
    const availableAssets: AssetInfo[] = [];
    
    // Rooftop Solar - only if revenue > 0
    if (targetAnalysis.analysis_results.rooftop?.revenue > 0) {
      availableAssets.push({
        type: 'rooftop',
        name: 'Solar Panels',
        monthlyRevenue: targetAnalysis.analysis_results.rooftop.revenue,
        area: `${targetAnalysis.analysis_results.rooftop.area} sq ft`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('rooftop')),
        hasRevenuePotential: true
      });
    }

    // Parking - only if revenue > 0 AND has actual spaces
    if (targetAnalysis.analysis_results.parking?.revenue > 0 && 
        targetAnalysis.analysis_results.parking?.spaces > 0) {
      availableAssets.push({
        type: 'parking',
        name: 'Parking Spaces',
        monthlyRevenue: targetAnalysis.analysis_results.parking.revenue,
        area: `${targetAnalysis.analysis_results.parking.spaces} spaces`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('parking')),
        hasRevenuePotential: true
      });
    }

    // Pool - only if present AND has revenue > 0
    if (targetAnalysis.analysis_results.pool?.present && 
        targetAnalysis.analysis_results.pool?.revenue > 0) {
      availableAssets.push({
        type: 'pool',
        name: 'Swimming Pool',
        monthlyRevenue: targetAnalysis.analysis_results.pool.revenue,
        area: `${targetAnalysis.analysis_results.pool.area} sq ft`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('pool')),
        hasRevenuePotential: true
      });
    }

    // Garden - only if revenue > 0
    if (targetAnalysis.analysis_results.garden?.revenue > 0) {
      availableAssets.push({
        type: 'garden',
        name: 'Garden Space',
        monthlyRevenue: targetAnalysis.analysis_results.garden.revenue,
        area: `${targetAnalysis.analysis_results.garden.area} sq ft`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('garden')),
        hasRevenuePotential: true
      });
    }

    // Bandwidth - only if revenue > 0
    if (targetAnalysis.analysis_results.bandwidth?.revenue > 0) {
      availableAssets.push({
        type: 'bandwidth',
        name: 'Internet Bandwidth',
        monthlyRevenue: targetAnalysis.analysis_results.bandwidth.revenue,
        area: `${targetAnalysis.analysis_results.bandwidth.available} Mbps`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('bandwidth')),
        hasRevenuePotential: true
      });
    }

    // Storage - only if revenue > 0
    if (targetAnalysis.analysis_results.storage?.revenue > 0) {
      availableAssets.push({
        type: 'storage',
        name: 'Storage Space',
        monthlyRevenue: targetAnalysis.analysis_results.storage.revenue,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('storage')),
        hasRevenuePotential: true
      });
    }

    // Sort by revenue potential (highest first)
    availableAssets.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    console.log('📊 [PROPERTY ANALYSIS] Available assets:', availableAssets.map(a => ({
      type: a.type,
      name: a.name,
      revenue: a.monthlyRevenue
    })));

    setPropertyData({
      address: primaryAddress,
      analysisResults: targetAnalysis.analysis_results,
      totalMonthlyRevenue: targetAnalysis.total_monthly_revenue,
      totalOpportunities: targetAnalysis.total_opportunities,
      availableAssets
    });

  }, [user, analyses, assetSelections, loading, getPrimaryAddress, params?.analysisId, params?.addressId, params?.forceRefresh]);

  return {
    propertyData,
    loading,
    hasPropertyData: !!propertyData
  };
};
