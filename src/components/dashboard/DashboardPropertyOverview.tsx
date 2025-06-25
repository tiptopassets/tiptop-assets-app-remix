
import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { PropertyOverviewCard } from './PropertyOverviewCard';
import { getGoogleMapsApiKey } from '@/utils/googleMapsLoader';

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
  const [dynamicSatelliteImageUrl, setDynamicSatelliteImageUrl] = useState<string | undefined>(satelliteImageUrl);
  
  // Generate satellite image URL if coordinates are available but no image URL is provided
  useEffect(() => {
    const generateSatelliteImage = async () => {
      if (!satelliteImageUrl && coordinates) {
        try {
          const apiKey = await getGoogleMapsApiKey();
          const generatedUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=20&size=800x800&maptype=satellite&key=${apiKey}`;
          setDynamicSatelliteImageUrl(generatedUrl);
          console.log('✅ Generated satellite image URL for dashboard');
        } catch (error) {
          console.error('❌ Failed to generate satellite image:', error);
        }
      }
    };

    generateSatelliteImage();
  }, [satelliteImageUrl, coordinates]);

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
        imageUrl={dynamicSatelliteImageUrl}
      />
    </motion.div>
  );
};
