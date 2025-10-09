
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import SolarPanelIcon from '@/components/asset-icons/SolarPanelIcon';
import GardenIcon from '@/components/asset-icons/GardenIcon';
import WifiIcon from '@/components/asset-icons/WifiIcon';
import ParkingIcon from '@/components/asset-icons/ParkingIcon';
import StorageIcon from '@/components/asset-icons/StorageIcon';
import CarIcon from '@/components/asset-icons/CarIcon';
import EVChargerIcon from '@/components/asset-icons/EVChargerIcon';
import SwimmingPoolIcon from '@/components/asset-icons/SwimmingPoolIcon';
import SportsCourtIcon from '@/components/asset-icons/SportsCourtIcon';
import HouseIcon from '@/components/asset-icons/HouseIcon';

const LoadingState = () => {
  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const monetizationTips = [
    "Did you know you could rent your parking and make $200-500/month?",
    "Did you know you could make $300-800/month by renting your pool?",
    "Your rooftop could generate $100-300/month with solar panels!",
    "Unused storage space can earn you $50-200/month.",
    "Your WiFi bandwidth could generate $20-50/month passively.",
    "EV charging stations could bring in $150-400/month.",
    "Your garden space could earn $100-250/month through sharing.",
    "Sports courts can generate $200-600/month in rental income.",
    "Extra parking spots are worth $150-350/month in urban areas.",
    "Your driveway could be a $100-300/month asset!"
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % monetizationTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  const assetIcons = [
    { component: HouseIcon, label: 'House' },
    { component: SolarPanelIcon, label: 'Solar Panel' },
    { component: GardenIcon, label: 'Garden' },
    { component: WifiIcon, label: 'WiFi' },
    { component: ParkingIcon, label: 'Parking' },
    { component: StorageIcon, label: 'Storage' },
    { component: CarIcon, label: 'Car' },
    { component: EVChargerIcon, label: 'EV Charger' },
    { component: SwimmingPoolIcon, label: 'Swimming Pool' },
    { component: SportsCourtIcon, label: 'Sports Court' },
  ];

  return (
    <div className="p-4 md:p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
      </div>

      {/* Asset Icons Carousel */}
      <div className="mb-8 overflow-hidden">
        <div className="flex animate-slide-left gap-4 w-max">
          {/* Triple the icons to create seamless infinite loop */}
          {[...assetIcons, ...assetIcons, ...assetIcons].map((asset, index) => {
            const IconComponent = asset.component;
            return (
              <div
                key={`${asset.label}-${index}`}
                className="flex-shrink-0 w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center"
                style={{
                  animation: `pulse 2s infinite ease-in-out ${index * 0.1}s`
                }}
              >
                <div className="w-8 h-8">
                  <IconComponent />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-4 space-y-2">
        <Progress 
          value={progress} 
          className="h-2 bg-black/40 border border-white/10"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Analyzing property images and data...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
      
      <p className="text-white text-lg font-medium transition-all duration-500 ease-in-out min-h-[32px] px-4">
        {monetizationTips[currentTipIndex]}
      </p>
    </div>
  );
};

export default LoadingState;
