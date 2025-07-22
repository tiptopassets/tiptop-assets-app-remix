
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
  
  // Prepare chart data from user's selected assets
  const chartData = assetSelections.map(selection => ({
    name: selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1),
    value: selection.monthly_revenue
  }));

  // Generate time series data with some variation
  const generateTimeSeriesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const data: any = { name: month };
      assetSelections.forEach(selection => {
        const assetName = selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1);
        // Add some realistic variation (±15%)
        const variation = 0.85 + Math.random() * 0.3;
        data[assetName] = Math.round(selection.monthly_revenue * variation);
      });
      return data;
    });
  };

  const timeSeriesData = generateTimeSeriesData();
  const timeSeriesKeys = assetSelections.map(selection => 
    selection.asset_type.charAt(0).toUpperCase() + selection.asset_type.slice(1)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AssetDistributionChart data={chartData} />
        <TodayRevenueChart amount={totalMonthlyRevenue / 30} increasePercentage={15} />
        <RevenueOverTimeChart 
          data={timeSeriesData}
          keys={timeSeriesKeys}
        />
      </div>
    </motion.div>
  );
};
