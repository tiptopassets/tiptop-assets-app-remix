
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import SolarPanelIcon from '@/components/asset-icons/SolarPanelIcon';
import GardenIcon from '@/components/asset-icons/GardenIcon';
import WifiIcon from '@/components/asset-icons/WifiIcon';
import ParkingIcon from '@/components/asset-icons/ParkingIcon';
import StorageIcon from '@/components/asset-icons/StorageIcon';
import CarIcon from '@/components/asset-icons/CarIcon';
import EVChargerIcon from '@/components/asset-icons/EVChargerIcon';

const LoadingState = () => {
  const [progress, setProgress] = useState(0);

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

  const assetIcons = [
    { component: SolarPanelIcon, label: 'Solar Panel' },
    { component: GardenIcon, label: 'Garden' },
    { component: WifiIcon, label: 'WiFi' },
    { component: ParkingIcon, label: 'Parking' },
    { component: StorageIcon, label: 'Storage' },
    { component: CarIcon, label: 'Car' },
    { component: EVChargerIcon, label: 'EV Charger' },
  ];

  return (
    <div className="p-4 md:p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
      </div>

      {/* Asset Icons Carousel */}
      <div className="mb-8 overflow-hidden">
        <div className="flex animate-slide-left gap-4">
          {/* Duplicate the icons to create seamless loop */}
          {[...assetIcons, ...assetIcons].map((asset, index) => {
            const IconComponent = asset.component;
            return (
              <div
                key={`${asset.label}-${index}`}
                className="flex-shrink-0 w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center animate-pulse"
                style={{
                  animationDelay: `${index * 0.3}s`,
                  animationDuration: '2s'
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
      
      <p className="text-white">Analyzing property images and data...</p>
    </div>
  );
};

export default LoadingState;
