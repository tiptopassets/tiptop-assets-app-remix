
import React from 'react';
import { motion } from "framer-motion";
import { PropertyOverviewCard } from './PropertyOverviewCard';

interface DashboardPropertyOverviewProps {
  address: string;
  createdAt: string;
  totalOpportunities: number;
  totalMonthlyRevenue: number;
}

export const DashboardPropertyOverview = ({ 
  address, 
  createdAt, 
  totalOpportunities, 
  totalMonthlyRevenue 
}: DashboardPropertyOverviewProps) => {
  const description = `Property analysis completed on ${new Date(createdAt).toLocaleDateString()}. Found ${totalOpportunities} monetization opportunities with potential monthly revenue of $${totalMonthlyRevenue}.`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <PropertyOverviewCard 
        address={address}
        description={description}
      />
    </motion.div>
  );
};
