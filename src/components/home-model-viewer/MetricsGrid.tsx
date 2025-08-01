
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Building2, Zap } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-effect rounded-xl p-4 text-center"
  >
    <div className={`w-8 h-8 mx-auto mb-3 ${color}`}>
      {icon}
    </div>
    <p className={`text-2xl font-bold mb-1 ${color}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
    <p className="text-white text-sm">{label}</p>
  </motion.div>
);

interface MetricsGridProps {
  analysisResults: any;
  totalOpportunities: number;
  selectedAssetsCount: number;
  totalSetupCost: number;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  analysisResults,
  totalOpportunities,
  selectedAssetsCount,
  totalSetupCost
}) => {
  const monthlyPotential = analysisResults?.totalMonthlyRevenue || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        icon={<DollarSign className="w-full h-full" />}
        value={`$${monthlyPotential}`}
        label="Monthly Potential"
        color="text-green-400"
      />
      <MetricCard
        icon={<TrendingUp className="w-full h-full" />}
        value={totalOpportunities}
        label="Opportunities"
        color="text-blue-400"
      />
      <MetricCard
        icon={<Building2 className="w-full h-full" />}
        value={selectedAssetsCount}
        label="Selected Assets"
        color="text-purple-400"
      />
      <MetricCard
        icon={<Zap className="w-full h-full" />}
        value={`$${totalSetupCost}`}
        label="Setup Investment"
        color="text-orange-400"
      />
    </div>
  );
};

export default MetricsGrid;
