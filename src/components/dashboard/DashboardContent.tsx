
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from './DashboardStats';
import { DashboardPropertyOverview } from './DashboardPropertyOverview';
import { DashboardCharts } from './DashboardCharts';
import { AssetsTable } from './AssetsTable';
import DashboardHeader from './DashboardHeader';

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
          totalMonthlyRevenue={totalMonthlyRevenue}
          totalOpportunities={totalOpportunities}
          analysesCount={analysesCount}
        />
      </motion.div>

      {/* Property Overview */}
      {latestAnalysis && (
        <DashboardPropertyOverview 
          address={primaryAddress || "Property Address"}
          createdAt={latestAnalysis.created_at}
          totalOpportunities={totalOpportunities}
          totalMonthlyRevenue={totalMonthlyRevenue}
          satelliteImageUrl={latestAnalysis.satellite_image_url}
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
              <CardTitle>Asset Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your property's monetization potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsTable analysisResults={analysisResults} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Revenue Charts */}
      {analysisResults && (
        <DashboardCharts 
          analysisResults={analysisResults}
          totalMonthlyRevenue={totalMonthlyRevenue}
        />
      )}
    </div>
  );
};

export default DashboardContent;
