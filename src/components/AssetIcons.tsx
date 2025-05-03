
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import './asset-icons/IconGlowEffect.css';
import { motion } from 'framer-motion';

// Import individual icon components
import HouseIcon from './asset-icons/HouseIcon';
import SolarPanelIcon from './asset-icons/SolarPanelIcon';
import GardenIcon from './asset-icons/GardenIcon';
import WifiIcon from './asset-icons/WifiIcon';
import ParkingIcon from './asset-icons/ParkingIcon';
import StorageIcon from './asset-icons/StorageIcon';
import SwimmingPoolIcon from './asset-icons/SwimmingPoolIcon';
import CarIcon from './asset-icons/CarIcon';
import EVChargerIcon from './asset-icons/EVChargerIcon';

const AssetIcons = () => {
  const { isAnalyzing, analysisComplete, address } = useGoogleMap();
  
  // Icons for row display after address entry
  const rowIcons = [
    { name: "Solar Panel", Component: SolarPanelIcon },
    { name: "Garden", Component: GardenIcon },
    { name: "WiFi", Component: WifiIcon },
    { name: "Parking", Component: ParkingIcon },
    { name: "Storage", Component: StorageIcon },
    { name: "Swimming Pool", Component: SwimmingPoolIcon },
    { name: "Car", Component: CarIcon },
    { name: "EV Charger", Component: EVChargerIcon }
  ];

  // Don't show icons when analysis is in progress or complete
  if (isAnalyzing || analysisComplete) return null;

  // Check if address has been entered but analysis hasn't started yet
  const hasAddress = !!address;

  // Show different layouts based on whether address has been entered
  return (
    <>
      {!hasAddress ? (
        // Circular layout with carousel effect around house when no address
        <div className="relative w-full h-[400px] flex items-center justify-center">
          <div className="relative w-64 h-64">
            <motion.div 
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 60, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {/* This is the container that rotates */}
              <div className="w-full h-full relative">
                <HouseIcon />
                <SolarPanelIcon />
                <GardenIcon />
                <WifiIcon />
                <ParkingIcon />
                <StorageIcon />
                <SwimmingPoolIcon />
                <CarIcon />
                <EVChargerIcon />
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        // Row layout when address is entered
        <motion.div 
          className="w-full flex flex-wrap justify-center gap-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {rowIcons.map((Icon, index) => (
            <motion.div 
              key={Icon.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="glass-icon-container"
            >
              <Icon.Component />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default AssetIcons;
