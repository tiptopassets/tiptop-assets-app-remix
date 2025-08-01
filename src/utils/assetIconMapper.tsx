
import React from 'react';
import CarIcon from '@/components/asset-icons/CarIcon';
import HouseIcon from '@/components/asset-icons/HouseIcon';
import SolarPanelIcon from '@/components/asset-icons/SolarPanelIcon';
import ParkingIcon from '@/components/asset-icons/ParkingIcon';
import GardenIcon from '@/components/asset-icons/GardenIcon';
import StorageIcon from '@/components/asset-icons/StorageIcon';
import WifiIcon from '@/components/asset-icons/WifiIcon';
import SwimmingPoolIcon from '@/components/asset-icons/SwimmingPoolIcon';
import EVChargerIcon from '@/components/asset-icons/EVChargerIcon';

export const getAssetIcon = (assetTitle: string): React.ReactNode => {
  const title = assetTitle.toLowerCase();
  
  // Rental properties and space rentals
  if (title.includes('airbnb') || 
      title.includes('rental') || 
      title.includes('event space') || 
      title.includes('co-working') || 
      title.includes('photography studio') || 
      title.includes('home gym') || 
      title.includes('game room') || 
      title.includes('meeting room') || 
      title.includes('music practice') || 
      title.includes('fitness studio') || 
      title.includes('art studio') || 
      title.includes('content creator') ||
      title.includes('music lessons') ||
      title.includes('gift wrapping')) {
    return <HouseIcon />;
  }
  
  // Pool related
  if (title.includes('pool') || title.includes('swimply')) {
    return <SwimmingPoolIcon />;
  }
  
  // Solar related
  if (title.includes('solar') || title.includes('rooftop')) {
    return <SolarPanelIcon />;
  }
  
  // Parking related
  if (title.includes('parking') || title.includes('park')) {
    return <ParkingIcon />;
  }
  
  // Garden related
  if (title.includes('garden') || 
      title.includes('composting') || 
      title.includes('dog boarding') || 
      title.includes('childcare') ||
      title.includes('produce')) {
    return <GardenIcon />;
  }
  
  // Storage related
  if (title.includes('storage') || 
      title.includes('package') || 
      title.includes('workshop') || 
      title.includes('tool') || 
      title.includes('bike repair') ||
      title.includes('book library') ||
      title.includes('coffee')) {
    return <StorageIcon />;
  }
  
  // Internet/Tech related
  if (title.includes('wifi') || 
      title.includes('internet') || 
      title.includes('bandwidth') || 
      title.includes('gaming server') || 
      title.includes('security monitoring')) {
    return <WifiIcon />;
  }
  
  // EV Charger related
  if (title.includes('ev') || title.includes('charger') || title.includes('charging')) {
    return <EVChargerIcon />;
  }
  
  // Car related (only for actual car services, not rentals)
  if (title.includes('car') && !title.includes('rental') && !title.includes('space')) {
    return <CarIcon />;
  }
  
  // Default to house icon for other services
  return <HouseIcon />;
};
