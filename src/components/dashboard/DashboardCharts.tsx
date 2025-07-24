
import React from 'react';
import { motion } from "framer-motion";
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from './RevenueCharts';
import { AnalysisResults } from '@/types/analysis';

interface DashboardChartsProps {
  analysisResults: AnalysisResults;
  totalMonthlyRevenue: number;
  assetSelections?: any[];
}

export const DashboardCharts = ({ 
  analysisResults, 
  totalMonthlyRevenue, 
  assetSelections = [] 
}: DashboardChartsProps) => {
  
  // Use asset selections if available, otherwise fall back to analysis results
  const useAssetSelections = assetSelections.length > 0;
  
  // Prepare chart data from asset selections or filtered analysis results
  const chartData = useAssetSelections 
    ? assetSelections.map(selection => ({
        name: selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1).replace('_', ' '),
        value: selection.monthly_revenue
      }))
    : [
        analysisResults.rooftop?.revenue > 0 && { name: 'Rooftop Solar', value: analysisResults.rooftop.revenue },
        analysisResults.garden?.revenue > 0 && { name: 'Garden Space', value: analysisResults.garden.revenue },
        analysisResults.parking?.revenue > 0 && { name: 'Parking Spaces', value: analysisResults.parking.revenue },
        analysisResults.pool?.revenue > 0 && { name: 'Swimming Pool', value: analysisResults.pool.revenue },
        analysisResults.bandwidth?.revenue > 0 && { name: 'Internet Bandwidth', value: analysisResults.bandwidth.revenue }
      ].filter(Boolean);

  // Filter assets that require setup costs for the setup cost chart
  const assetsWithSetupCosts = useAssetSelections
    ? assetSelections.filter(selection => selection.setup_cost > 0)
    : [];
  
  // Generate setup cost data - showing one-time setup cost, not monthly recurring
  const generateSetupCostData = () => {
    if (assetsWithSetupCosts.length === 0) return [];
    
    const phases = ['Initial Setup', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    return phases.map((phase, index) => {
      const data: any = { name: phase };
      assetsWithSetupCosts.forEach(asset => {
        const assetDisplayName = asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1).replace('_', ' ');
        if (index === 0) {
          // Initial setup cost only in first phase
          data[assetDisplayName] = asset.setup_cost;
        } else {
          // Maintenance fee (10% of setup cost) for subsequent months
          data[assetDisplayName] = Math.round(asset.setup_cost * 0.1);
        }
      });
      return data;
    });
  };

  const setupCostData = generateSetupCostData();
  const setupCostKeys = assetsWithSetupCosts.map(asset => 
    asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1).replace('_', ' ')
  );
  
  // Calculate total monthly revenue from the provided data
  const actualTotalMonthly = useAssetSelections
    ? assetSelections.reduce((sum, asset) => sum + asset.monthly_revenue, 0)
    : totalMonthlyRevenue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AssetDistributionChart data={chartData} />
        <TodayRevenueChart 
          monthlyAmount={actualTotalMonthly} 
          increasePercentage={15} 
        />
        {setupCostData.length > 0 && (
          <RevenueOverTimeChart 
            data={setupCostData}
            keys={setupCostKeys}
            title="Setup Costs & Maintenance"
          />
        )}
      </div>
    </motion.div>
  );
};
