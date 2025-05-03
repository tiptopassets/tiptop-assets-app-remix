
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import './asset-icons/IconGlowEffect.css';

// Import individual icon components
import HouseIcon from './asset-icons/HouseIcon';
import SolarPanelIcon from './asset-icons/SolarPanelIcon';
import GardenIcon from './asset-icons/GardenIcon';
import WifiIcon from './asset-icons/WifiIcon';
import ParkingIcon from './asset-icons/ParkingIcon';
import StorageIcon from './asset-icons/StorageIcon';
import SwimmingPoolIcon from './asset-icons/SwimmingPoolIcon';
import CarIcon from './asset-icons/CarIcon';

const AssetIcons = () => {
  const { isAnalyzing, analysisComplete } = useGoogleMap();

  // Don't show icons when analysis is in progress or complete
  if (isAnalyzing || analysisComplete) return null;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* 3D House in the center */}
      <HouseIcon />

      {/* Asset Icons */}
      <SolarPanelIcon />
      <GardenIcon />
      <WifiIcon />
      <ParkingIcon />
      <StorageIcon />
      <SwimmingPoolIcon />
      <CarIcon />
    </div>
  );
};

export default AssetIcons;
