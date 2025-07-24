
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from './DashboardStats';
import DashboardPropertyOverview from './DashboardPropertyOverview';
import { DashboardCharts } from './DashboardCharts';
import { AssetsTable } from './AssetsTable';
import DashboardHeader from './DashboardHeader';
import SavedAssetSelections from './SavedAssetSelections';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import AssetSelectionDebug from './AssetSelectionDebug';

interface DashboardContentProps {
  primaryAddress?: string;
  latestAnalysis: any;
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  analysesCount: number;
  onRefresh: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  primaryAddress,
  latestAnalysis,
  totalMonthlyRevenue,
  totalOpportunities,
  analysesCount,
  onRefresh
}) => {
  // Use the latest analysis ID to filter asset selections for this specific property
  const { assetSelections, isAssetConfigured } = useUserAssetSelections({
    analysisId: latestAnalysis?.id
  });
  
  // Calculate actual totals based on user selections for THIS analysis only
  const hasUserSelections = assetSelections.length > 0;
  
  console.log('📊 Dashboard Content - Asset Selection Context:', {
    analysisId: latestAnalysis?.id,
    primaryAddress,
    assetSelectionsCount: assetSelections.length,
    hasUserSelections,
    selections: assetSelections.map(s => ({
      asset_type: s.asset_type,
      analysis_id: s.analysis_id,
      monthly_revenue: s.monthly_revenue
    }))
  });
  
  // Deduplicate asset selections for accurate calculations (within this analysis)
  const uniqueAssetSelections = hasUserSelections ? assetSelections.reduce((acc, selection) => {
    const existingIndex = acc.findIndex(existing => 
      existing.asset_type.toLowerCase() === selection.asset_type.toLowerCase()
    );
    
    if (existingIndex === -1) {
      // Asset type not found, add it
      acc.push(selection);
    } else {
      // Asset type exists, keep the more recent one
      const existingDate = new Date(acc[existingIndex].selected_at);
      const currentDate = new Date(selection.selected_at);
      
      if (currentDate > existingDate) {
        acc[existingIndex] = selection;
      }
    }
    
    return acc;
  }, [] as typeof assetSelections) : [];

  const actualTotalRevenue = hasUserSelections 
    ? uniqueAssetSelections.reduce((sum, selection) => sum + (selection.monthly_revenue || 0), 0)
    : totalMonthlyRevenue;
  
  const actualTotalOpportunities = hasUserSelections 
    ? uniqueAssetSelections.length 
    : totalOpportunities;

  // Filter analysis results to only show selected assets for THIS analysis
  const getFilteredAnalysisResults = () => {
    const analysisResults = latestAnalysis?.analysis_results;
    
    if (!analysisResults || !hasUserSelections) {
      return analysisResults;
    }

    console.log('🔍 Filtering analysis results for specific analysis:', {
      analysisId: latestAnalysis?.id,
      originalAnalysisResults: analysisResults,
      userSelections: uniqueAssetSelections
    });

    const filtered = { ...analysisResults };
    
    // Create a set of selected asset types for efficient lookup
    const selectedAssetTypes = new Set(
      uniqueAssetSelections.map(selection => selection.asset_type.toLowerCase())
    );

    // Filter each asset type based on user selections for THIS analysis only
    if (!selectedAssetTypes.has('rooftop') && !selectedAssetTypes.has('solar')) {
      filtered.rooftop = { ...filtered.rooftop, revenue: 0, solarPotential: false };
    }
    
    if (!selectedAssetTypes.has('garden') && !selectedAssetTypes.has('yard')) {
      filtered.garden = { ...filtered.garden, revenue: 0, opportunity: 'Low' };
    }
    
    if (!selectedAssetTypes.has('parking')) {
      filtered.parking = { ...filtered.parking, revenue: 0, spaces: 0 };
    }
    
    if (!selectedAssetTypes.has('pool')) {
      filtered.pool = { ...filtered.pool, revenue: 0, present: false };
    }
    
    if (!selectedAssetTypes.has('bandwidth') && !selectedAssetTypes.has('internet')) {
      filtered.bandwidth = { ...filtered.bandwidth, revenue: 0, available: 0 };
    }

    // Update the filtered results with actual selected revenue values from THIS analysis
    uniqueAssetSelections.forEach(selection => {
      const assetType = selection.asset_type.toLowerCase();
      
      if (assetType.includes('rooftop') || assetType.includes('solar')) {
        filtered.rooftop = { ...filtered.rooftop, revenue: selection.monthly_revenue };
      } else if (assetType.includes('garden') || assetType.includes('yard')) {
        filtered.garden = { ...filtered.garden, revenue: selection.monthly_revenue };
      } else if (assetType.includes('parking')) {
        filtered.parking = { ...filtered.parking, revenue: selection.monthly_revenue };
      } else if (assetType.includes('pool')) {
        filtered.pool = { ...filtered.pool, revenue: selection.monthly_revenue };
      } else if (assetType.includes('bandwidth') || assetType.includes('internet')) {
        filtered.bandwidth = { ...filtered.bandwidth, revenue: selection.monthly_revenue };
      }
    });

    console.log('✅ Filtered analysis results for this property:', {
      analysisId: latestAnalysis?.id,
      filtered
    });
    return filtered;
  };

  const filteredAnalysisResults = getFilteredAnalysisResults();

  return (
    <div className="space-y-6">
      {/* Header with Property Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <DashboardHeader 
          primaryAddress={primaryAddress}
          onRefresh={onRefresh}
        />

        {/* Stats Cards - showing data for current analysis only */}
        <DashboardStats 
          totalMonthlyRevenue={actualTotalRevenue}
          totalOpportunities={actualTotalOpportunities}
          analysesCount={analysesCount}
        />
      </motion.div>

      {/* Property Overview - Pass filtered results and selection data */}
      {latestAnalysis && (
        <DashboardPropertyOverview 
          analysis={{
            ...latestAnalysis,
            analysis_results: filteredAnalysisResults
          }}
          address={primaryAddress}
          assetSelections={uniqueAssetSelections}
          hasUserSelections={hasUserSelections}
        />
      )}

      {/* Assets Table - Only show if user has selections for THIS analysis */}
      {filteredAnalysisResults && hasUserSelections && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Selected Assets</CardTitle>
              <CardDescription>
                Assets selected for this property analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsTable 
                analysisResults={filteredAnalysisResults} 
                isAssetConfigured={isAssetConfigured}
                analysisId={latestAnalysis?.id}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Show message if no assets selected for this analysis */}
      {!hasUserSelections && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>No Assets Selected</CardTitle>
              <CardDescription>
                You haven't selected any assets for this property yet. Visit the property analysis page to choose your assets.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {/* Debug Component for Development */}
      <AssetSelectionDebug />

      {/* Revenue Charts - Only show if user has selections for THIS analysis */}
      {filteredAnalysisResults && hasUserSelections && (
        <DashboardCharts 
          analysisResults={filteredAnalysisResults}
          totalMonthlyRevenue={actualTotalRevenue}
          assetSelections={uniqueAssetSelections}
        />
      )}
    </div>
  );
};

export default DashboardContent;
