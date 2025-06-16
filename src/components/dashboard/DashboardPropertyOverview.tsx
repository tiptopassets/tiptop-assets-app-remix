
import React from 'react';
import { motion } from "framer-motion";
import { PropertyOverviewCard } from './PropertyOverviewCard';

interface DashboardPropertyOverviewProps {
  address: string;
  createdAt: string;
  totalOpportunities: number;
  totalMonthlyRevenue: number;
  satelliteImageUrl?: string;
}

export const DashboardPropertyOverview = ({ 
  address, 
  createdAt, 
  totalOpportunities, 
  totalMonthlyRevenue,
  satelliteImageUrl
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
        imageUrl={satelliteImageUrl}
      />
    </motion.div>
  );
};
