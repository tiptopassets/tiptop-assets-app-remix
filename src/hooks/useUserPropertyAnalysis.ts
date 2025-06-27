
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

export const useUserPropertyAnalysis = () => {
  const { user } = useAuth();
  const { analyses, assetSelections, getPrimaryAddress, loading } = useUserData();
  const [propertyData, setPropertyData] = useState<PropertyAnalysisData | null>(null);

  useEffect(() => {
    if (!user || loading || analyses.length === 0) {
      setPropertyData(null);
      return;
    }

    const latestAnalysis = analyses[0];
    const primaryAddress = getPrimaryAddress()?.address || 'Your Property';
    
    // Map analysis results to asset info
    const availableAssets: AssetInfo[] = [];
    
    // Rooftop Solar
    if (latestAnalysis.analysis_results.rooftop?.revenue > 0) {
      availableAssets.push({
        type: 'rooftop',
        name: 'Solar Panels',
        monthlyRevenue: latestAnalysis.analysis_results.rooftop.revenue,
        area: `${latestAnalysis.analysis_results.rooftop.area} sq ft`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('rooftop')),
        hasRevenuePotential: true
      });
    }

    // Parking
    if (latestAnalysis.analysis_results.parking?.revenue > 0) {
      availableAssets.push({
        type: 'parking',
        name: 'Parking Spaces',
        monthlyRevenue: latestAnalysis.analysis_results.parking.revenue,
        area: `${latestAnalysis.analysis_results.parking.spaces} spaces`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('parking')),
        hasRevenuePotential: true
      });
    }

    // Pool
    if (latestAnalysis.analysis_results.pool?.present && latestAnalysis.analysis_results.pool?.revenue > 0) {
      availableAssets.push({
        type: 'pool',
        name: 'Swimming Pool',
        monthlyRevenue: latestAnalysis.analysis_results.pool.revenue,
        area: `${latestAnalysis.analysis_results.pool.area} sq ft`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('pool')),
        hasRevenuePotential: true
      });
    }

    // Garden
    if (latestAnalysis.analysis_results.garden?.revenue > 0) {
      availableAssets.push({
        type: 'garden',
        name: 'Garden Space',
        monthlyRevenue: latestAnalysis.analysis_results.garden.revenue,
        area: `${latestAnalysis.analysis_results.garden.area} sq ft`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('garden')),
        hasRevenuePotential: true
      });
    }

    // Bandwidth
    if (latestAnalysis.analysis_results.bandwidth?.revenue > 0) {
      availableAssets.push({
        type: 'bandwidth',
        name: 'Internet Bandwidth',
        monthlyRevenue: latestAnalysis.analysis_results.bandwidth.revenue,
        area: `${latestAnalysis.analysis_results.bandwidth.available} Mbps`,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('bandwidth')),
        hasRevenuePotential: true
      });
    }

    // Storage
    if (latestAnalysis.analysis_results.storage?.revenue > 0) {
      availableAssets.push({
        type: 'storage',
        name: 'Storage Space',
        monthlyRevenue: latestAnalysis.analysis_results.storage.revenue,
        isConfigured: assetSelections.some(s => s.asset_type.toLowerCase().includes('storage')),
        hasRevenuePotential: true
      });
    }

    // Sort by revenue potential (highest first)
    availableAssets.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    setPropertyData({
      address: primaryAddress,
      analysisResults: latestAnalysis.analysis_results,
      totalMonthlyRevenue: latestAnalysis.total_monthly_revenue,
      totalOpportunities: latestAnalysis.total_opportunities,
      availableAssets
    });

  }, [user, analyses, assetSelections, loading, getPrimaryAddress]);

  return {
    propertyData,
    loading,
    hasPropertyData: !!propertyData
  };
};
