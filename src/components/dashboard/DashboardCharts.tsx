import React from 'react';
import { motion } from "framer-motion";
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from './RevenueCharts';
import { AnalysisResults } from '@/types/analysis';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';

interface DashboardChartsProps {
  analysisResults: AnalysisResults;
  totalMonthlyRevenue: number;
  analysisId?: string;
}

export const DashboardCharts = ({ analysisResults, totalMonthlyRevenue, analysisId }: DashboardChartsProps) => {
  // Filter asset selections by analysis ID to scope charts to current property
  const { assetSelections } = useUserAssetSelections(analysisId);
  
  // Properly deduplicate assets by keeping only the most recent selection for each asset type
  const deduplicatedAssets = assetSelections.reduce((acc, selection) => {
    const assetType = selection.asset_type.toLowerCase();
    const displayName = selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1).replace('_', ' ');
    
    const existingAssetIndex = acc.findIndex(asset => asset.asset_type === assetType);
    
    if (existingAssetIndex !== -1) {
      // Keep the more recent selection
      const existingDate = new Date(acc[existingAssetIndex].selected_at);
      const currentDate = new Date(selection.selected_at);
      
      if (currentDate > existingDate) {
        acc[existingAssetIndex] = {
          asset_type: assetType,
          name: displayName,
          monthly_revenue: selection.monthly_revenue,
          setup_cost: selection.setup_cost,
          selected_at: selection.selected_at
        };
      }
    } else {
      // First occurrence of this asset type
      acc.push({
        asset_type: assetType,
        name: displayName,
        monthly_revenue: selection.monthly_revenue,
        setup_cost: selection.setup_cost,
        selected_at: selection.selected_at
      });
    }
    return acc;
  }, [] as any[]);
  
  // Prepare chart data from deduplicated assets
  const chartData = deduplicatedAssets.map(asset => ({
    name: asset.name,
    value: asset.monthly_revenue
  }));

  // Filter assets that require setup costs for the setup cost chart
  const assetsWithSetupCosts = deduplicatedAssets.filter(asset => asset.setup_cost > 0);
  
  // Generate setup cost data - showing one-time setup cost, not monthly recurring
  const generateSetupCostData = () => {
    const phases = ['Initial Setup', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    return phases.map((phase, index) => {
      const data: any = { name: phase };
      assetsWithSetupCosts.forEach(asset => {
        if (index === 0) {
          // Initial setup cost only in first phase
          data[asset.name] = asset.setup_cost;
        } else {
          // Maintenance fee (10% of setup cost) for subsequent months
          data[asset.name] = Math.round(asset.setup_cost * 0.1);
        }
      });
      return data;
    });
  };

  const setupCostData = generateSetupCostData();
  const setupCostKeys = assetsWithSetupCosts.map(asset => asset.name);
  
  // Calculate total monthly revenue from deduplicated assets
  const actualTotalMonthly = deduplicatedAssets.reduce((sum, asset) => sum + asset.monthly_revenue, 0);

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
        <RevenueOverTimeChart 
          data={setupCostData}
          keys={setupCostKeys}
          title="Setup Costs & Maintenance"
        />
      </div>
    </motion.div>
  );
};
