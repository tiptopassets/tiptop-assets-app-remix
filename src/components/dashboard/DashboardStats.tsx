
import React from 'react';
import { motion } from "framer-motion";
import { StatsCard } from './StatsCard';
import { DollarSign, TrendingUp, Home } from 'lucide-react';

interface DashboardStatsProps {
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  analysesCount: number;
}

export const DashboardStats = ({ 
  totalMonthlyRevenue, 
  totalOpportunities, 
  analysesCount 
}: DashboardStatsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <StatsCard
        title="Monthly Revenue Potential"
        value={`$${totalMonthlyRevenue.toLocaleString()}`}
        icon={<DollarSign className="h-6 w-6" />}
        trend={totalMonthlyRevenue > 0 ? "up" : "neutral"}
        trendValue={totalMonthlyRevenue > 0 ? "Ready to earn" : "Analyze property"}
      />
      <StatsCard
        title="Monetization Opportunities"
        value={totalOpportunities.toString()}
        icon={<TrendingUp className="h-6 w-6" />}
        trend={totalOpportunities > 0 ? "up" : "neutral"}
        trendValue={totalOpportunities > 0 ? "Available now" : "Get started"}
      />
      <StatsCard
        title="Properties Analyzed"
        value={analysesCount.toString()}
        icon={<Home className="h-6 w-6" />}
        trend={analysesCount > 0 ? "up" : "neutral"}
        trendValue={analysesCount > 1 ? `${analysesCount} properties` : "First property"}
      />
    </motion.div>
  );
};
