
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

// Import asset icons for the carousel
import SolarPanelIcon from '../asset-icons/SolarPanelIcon';
import GardenIcon from '../asset-icons/GardenIcon';
import WifiIcon from '../asset-icons/WifiIcon';
import ParkingIcon from '../asset-icons/ParkingIcon';
import StorageIcon from '../asset-icons/StorageIcon';
import SwimmingPoolIcon from '../asset-icons/SwimmingPoolIcon';
import SportsCourtIcon from '../asset-icons/SportsCourtIcon';
import CarIcon from '../asset-icons/CarIcon';
import EVChargerIcon from '../asset-icons/EVChargerIcon';

const LoadingState = () => {
  const [progress, setProgress] = useState(0);

  // Icons for the animated carousel
  const carouselIcons = [
    { name: "Solar Panel", Component: SolarPanelIcon },
    { name: "Garden", Component: GardenIcon },
    { name: "WiFi", Component: WifiIcon },
    { name: "Parking", Component: ParkingIcon },
    { name: "Storage", Component: StorageIcon },
    { name: "Swimming Pool", Component: SwimmingPoolIcon },
    { name: "Sports Courts", Component: SportsCourtIcon },
    { name: "Car", Component: CarIcon },
    { name: "EV Charger", Component: EVChargerIcon }
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

  return (
    <div className="p-4 md:p-6 text-center">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Analyzing Your Property...
        </h2>
        <p className="text-gray-300">Please wait while our AI analyzes your property</p>
      </div>

      {/* Animated Icon Carousel */}
      <div className="relative overflow-hidden mb-8 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4">
        <motion.div
          className="flex gap-6 items-center"
          animate={{
            x: [0, -100, -200, -300, -400, -500, -600, -700, -800],
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {/* Duplicate icons for seamless loop */}
          {[...carouselIcons, ...carouselIcons, ...carouselIcons].map((icon, index) => (
            <motion.div
              key={`${icon.name}-${index}`}
              className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12">
                <icon.Component />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
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
