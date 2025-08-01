
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OpportunityCardProps {
  opportunity: {
    title: string;
    monthlyRevenue: number;
    setupCost: number;
    roi: string;
    description: string;
    category?: string;
  };
  index: number;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="font-semibold text-white mb-1">{opportunity.title}</h3>
        <p className="text-white text-sm mb-2">{opportunity.description}</p>
        {opportunity.category && (
          <Badge variant="outline" className="text-white border-white/20 text-xs">
            {opportunity.category}
          </Badge>
        )}
      </div>
      <div className="text-right">
        <p className="text-green-400 font-bold text-lg">
          ${opportunity.monthlyRevenue}/mo
        </p>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <DollarSign className="w-3 h-3 text-orange-400 mr-1" />
          <span className="text-white text-xs">Setup</span>
        </div>
        <p className="text-white text-sm font-medium">${opportunity.setupCost}</p>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <Clock className="w-3 h-3 text-blue-400 mr-1" />
          <span className="text-white text-xs">ROI</span>
        </div>
        <p className="text-white text-sm font-medium">{opportunity.roi}</p>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="w-3 h-3 text-purple-400 mr-1" />
          <span className="text-white text-xs">Growth</span>
        </div>
        <p className="text-white text-sm font-medium">High</p>
      </div>
    </div>
  </motion.div>
);

interface TopOpportunitiesProps {
  opportunities: any[];
}

const TopOpportunities: React.FC<TopOpportunitiesProps> = ({ opportunities }) => {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white">No opportunities identified for this property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <h2 className="text-xl font-bold text-white">Top Revenue Opportunities</h2>
      </div>
      
      <div className="space-y-3">
        {opportunities.slice(0, 5).map((opportunity, index) => (
          <OpportunityCard
            key={index}
            opportunity={opportunity}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default TopOpportunities;
