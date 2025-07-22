
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
  const analysisResults = latestAnalysis?.analysis_results;
  const { assetSelections, isAssetConfigured } = useUserAssetSelections();
  
  // Calculate actual totals based on user selections with deduplication
  const hasUserSelections = assetSelections.length > 0;
  
  // Deduplicate asset selections for accurate calculations
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

        {/* Stats Cards */}
        <DashboardStats 
          totalMonthlyRevenue={actualTotalRevenue}
          totalOpportunities={actualTotalOpportunities}
          analysesCount={analysesCount}
        />
      </motion.div>

      {/* Property Overview */}
      {latestAnalysis && (
        <DashboardPropertyOverview 
          analysis={latestAnalysis}
          address={primaryAddress}
        />
      )}

      {/* Assets Table */}
      {analysisResults && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Potential Assets Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your property's monetization potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsTable 
                analysisResults={analysisResults} 
                isAssetConfigured={isAssetConfigured}
                analysisId={latestAnalysis?.id}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Debug Component for Development */}
      <AssetSelectionDebug />

      {/* Saved Asset Selections - Hidden since info is now in Overview card */}
      {/* 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SavedAssetSelections />
      </motion.div>
      */}

      {/* Revenue Charts */}
      {analysisResults && (
        <DashboardCharts 
          analysisResults={analysisResults}
          totalMonthlyRevenue={actualTotalRevenue}
        />
      )}
    </div>
  );
};

export default DashboardContent;
