
import React from 'react';
import { motion } from "framer-motion";
import { StatsCard } from './StatsCard';
import { PropertyStatsCard } from './PropertyStatsCard';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navigateToChatbot } from '@/utils/navigationHelpers';

interface DashboardStatsProps {
  totalMonthlyRevenue: number;
  totalOpportunities: number;
  analysesCount: number;
  properties?: Array<{ id: string; address: string; }>;
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
  analysisId?: string;
}

export const DashboardStats = ({ 
  totalMonthlyRevenue, 
  totalOpportunities, 
  analysesCount,
  properties = [],
  selectedPropertyId,
  onPropertySelect,
  analysisId
}: DashboardStatsProps) => {
  const navigate = useNavigate();

  const handleRevenueCardClick = () => {
    if (analysisId) {
      const chatbotUrl = navigateToChatbot(analysisId);
      sessionStorage.setItem('triggerBubbleInteraction', 'true');
      navigate(chatbotUrl);
    }
  };

  const handleOpportunitiesCardClick = () => {
    if (analysisId) {
      const chatbotUrl = navigateToChatbot(analysisId);
      sessionStorage.setItem('triggerBubbleInteraction', 'true');
      navigate(chatbotUrl);
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-2 md:gap-6"
    >
      <StatsCard
        title="Monthly Revenue Potential"
        value={`$${totalMonthlyRevenue.toLocaleString()}`}
        icon={<DollarSign className="h-6 w-6" />}
        trend={totalMonthlyRevenue > 0 ? "up" : "neutral"}
        trendValue={totalMonthlyRevenue > 0 ? "Ready to earn" : "Analyze property"}
        onClick={handleRevenueCardClick}
      />
      <StatsCard
        title="Monetization Opportunities"
        value={totalOpportunities.toString()}
        icon={<TrendingUp className="h-6 w-6" />}
        trend={totalOpportunities > 0 ? "up" : "neutral"}
        trendValue={totalOpportunities > 0 ? "Available now" : "Get started"}
        onClick={handleOpportunitiesCardClick}
      />
      <PropertyStatsCard
        analysesCount={analysesCount}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertySelect={onPropertySelect}
      />
    </motion.div>
  );
};
