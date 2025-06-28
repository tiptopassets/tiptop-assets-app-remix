
import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import PropertyOverviewCard from './PropertyOverviewCard';
import { useSatelliteImage } from '@/hooks/useSatelliteImage';

interface DashboardPropertyOverviewProps {
  address: string;
  createdAt: string;
  totalOpportunities: number;
  totalMonthlyRevenue: number;
  satelliteImageUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export const DashboardPropertyOverview = ({ 
  address, 
  createdAt, 
  totalOpportunities, 
  totalMonthlyRevenue,
  satelliteImageUrl,
  coordinates
}: DashboardPropertyOverviewProps) => {
  // Use the new satellite image hook for real-time updates
  const { imageUrl: realtimeImageUrl, loading: imageLoading } = useSatelliteImage(address, coordinates);
  
  // Prefer real-time image over stored image
  const finalImageUrl = realtimeImageUrl || satelliteImageUrl;
  
  const description = `Property analysis completed on ${new Date(createdAt).toLocaleDateString()}. Found ${totalOpportunities} monetization opportunities with potential monthly revenue of $${totalMonthlyRevenue.toLocaleString()}.`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <PropertyOverviewCard 
        address={address}
        description={description}
        imageUrl={finalImageUrl}
        loading={imageLoading}
      />
    </motion.div>
  );
};
