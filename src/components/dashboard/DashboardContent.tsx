
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from './DashboardStats';
import DashboardPropertyOverview from './DashboardPropertyOverview';
import { DashboardCharts } from './DashboardCharts';
import { AssetsTable } from './AssetsTable';
import DashboardHeader from './DashboardHeader';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';

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
  
  // Calculate actual totals based on user selections
  const actualTotalRevenue = assetSelections.length > 0 
    ? assetSelections.reduce((sum, selection) => sum + (selection.monthly_revenue || 0), 0)
    : totalMonthlyRevenue;
  
  const actualTotalOpportunities = assetSelections.length > 0 
    ? assetSelections.length 
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
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

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
