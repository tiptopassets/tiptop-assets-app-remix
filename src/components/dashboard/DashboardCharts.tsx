
import React from 'react';
import { motion } from "framer-motion";
import { AssetDistributionChart, TodayRevenueChart, RevenueOverTimeChart } from './RevenueCharts';
import { AnalysisResults } from '@/types/analysis';

interface DashboardChartsProps {
  analysisResults: AnalysisResults;
  totalMonthlyRevenue: number;
}

export const DashboardCharts = ({ analysisResults, totalMonthlyRevenue }: DashboardChartsProps) => {
  // Prepare chart data from analysis results
  const chartData = [];
  if (analysisResults?.rooftop?.revenue) {
    chartData.push({ name: 'Solar/Rooftop', value: analysisResults.rooftop.revenue });
  }
  if (analysisResults?.parking?.revenue) {
    chartData.push({ name: 'Parking', value: analysisResults.parking.revenue });
  }
  if (analysisResults?.garden?.revenue) {
    chartData.push({ name: 'Garden', value: analysisResults.garden.revenue });
  }
  if (analysisResults?.pool?.revenue) {
    chartData.push({ name: 'Pool', value: analysisResults.pool.revenue });
  }
  if (analysisResults?.storage?.revenue) {
    chartData.push({ name: 'Storage', value: analysisResults.storage.revenue });
  }
  if (analysisResults?.bandwidth?.revenue) {
    chartData.push({ name: 'Internet', value: analysisResults.bandwidth.revenue });
  }

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
          data={[
            { name: 'Jan', Solar: analysisResults?.rooftop?.revenue || 0, Parking: analysisResults?.parking?.revenue || 0 },
            { name: 'Feb', Solar: analysisResults?.rooftop?.revenue || 0, Parking: analysisResults?.parking?.revenue || 0 },
            { name: 'Mar', Solar: analysisResults?.rooftop?.revenue || 0, Parking: analysisResults?.parking?.revenue || 0 },
          ]}
          keys={['Solar', 'Parking']}
        />
      </div>
    </motion.div>
  );
};
