
import React from 'react';
import { motion } from "framer-motion";
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from './RevenueCharts';
import { AnalysisResults } from '@/types/analysis';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';

interface DashboardChartsProps {
  analysisResults: AnalysisResults;
  totalMonthlyRevenue: number;
}

export const DashboardCharts = ({ analysisResults, totalMonthlyRevenue }: DashboardChartsProps) => {
  const { assetSelections } = useUserAssetSelections();
  
  // Deduplicate assets by type and sum their revenues
  const deduplicatedAssets = assetSelections.reduce((acc, selection) => {
    const assetType = selection.asset_type.toLowerCase();
    const displayName = selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1).replace('_', ' ');
    
    if (acc[assetType]) {
      // Sum the revenues for duplicate asset types
      acc[assetType].monthly_revenue += selection.monthly_revenue;
      acc[assetType].setup_cost += selection.setup_cost;
    } else {
      // First occurrence of this asset type
      acc[assetType] = {
        asset_type: assetType,
        name: displayName,
        monthly_revenue: selection.monthly_revenue,
        setup_cost: selection.setup_cost
      };
    }
    return acc;
  }, {} as Record<string, any>);

  const uniqueAssets = Object.values(deduplicatedAssets);
  
  // Prepare chart data from deduplicated assets
  const chartData = uniqueAssets.map(asset => ({
    name: asset.name,
    value: asset.monthly_revenue
  }));

  // Filter assets that require setup costs for the setup cost chart
  const assetsWithSetupCosts = uniqueAssets.filter(asset => asset.setup_cost > 0);
  
  // Generate setup cost data over time
  const generateSetupCostData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const data: any = { name: month };
      assetsWithSetupCosts.forEach(asset => {
        data[asset.name] = asset.setup_cost;
      });
      return data;
    });
  };

  const setupCostData = generateSetupCostData();
  const setupCostKeys = assetsWithSetupCosts.map(asset => asset.name);
  
  // Calculate total monthly revenue from deduplicated assets
  const actualTotalMonthly = uniqueAssets.reduce((sum, asset) => sum + asset.monthly_revenue, 0);

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
          title="Required Setup Costs"
        />
      </div>
    </motion.div>
  );
};
