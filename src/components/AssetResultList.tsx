
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from "framer-motion";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from "@/components/ui/card";

// Import individual asset icon components to reuse
import SolarPanelIcon from './asset-icons/SolarPanelIcon';
import GardenIcon from './asset-icons/GardenIcon';
import WifiIcon from './asset-icons/WifiIcon';
import ParkingIcon from './asset-icons/ParkingIcon';
import StorageIcon from './asset-icons/StorageIcon';
import SwimmingPoolIcon from './asset-icons/SwimmingPoolIcon';
import CarIcon from './asset-icons/CarIcon';
import EVChargerIcon from './asset-icons/EVChargerIcon';

const iconMap = {
  "parking": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/72c97a7c-f1cb-47be-9354-616e819e15ee.png" 
        alt="Parking Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(155, 135, 245, 0.6))' }}
      />
    </div>
  ),
  "solar": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/4ac94444-6856-4868-a7d1-4649c212b28a.png" 
        alt="Solar Panel" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0, 0.6))' }}
      />
    </div>
  ),
  "garden": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/ef52333e-7ea8-4692-aeed-9a222da95b75.png" 
        alt="Garden Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.6))' }}
      />
    </div>
  ),
  "storage": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/417dfc9f-434d-4b41-aec2-fca0d8c4cb23.png" 
        alt="Storage Box" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11, 0.6))' }}
      />
    </div>
  ),
  "wifi": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/f5bf9c32-688f-4a52-8a95-4d803713d2ff.png" 
        alt="WiFi Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(155, 135, 245, 0.6))' }}
      />
    </div>
  ),
  "pool": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/76f34c86-decf-4d23-aeee-b23ba55c1be1.png" 
        alt="Swimming Pool Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.6))' }}
      />
    </div>
  ),
  "car": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/5169ceb8-ccbc-4b72-8758-a91052320c2c.png" 
        alt="Car Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.6))' }}
      />
    </div>
  ),
  "evcharger": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <img 
        src="/lovable-uploads/33b65ff0-5489-400b-beba-1248db897a30.png" 
        alt="EV Charger Icon" 
        className="w-8 h-8 object-contain"
        style={{ filter: 'drop-shadow(0 0 5px rgba(167, 139, 250, 0.6))' }}
      />
    </div>
  )
};

// Map for background colors based on icon type
const cardColorMap = {
  "parking": "from-indigo-500/30 to-purple-600/20",
  "solar": "from-yellow-500/30 to-amber-600/20",
  "garden": "from-green-500/30 to-emerald-600/20",
  "storage": "from-amber-500/30 to-orange-600/20",
  "wifi": "from-purple-500/30 to-violet-600/20",
  "pool": "from-blue-500/30 to-sky-600/20",
  "car": "from-indigo-500/30 to-blue-600/20",
  "evcharger": "from-violet-500/30 to-purple-600/20"
};

// Map for glow colors
const glowColorMap = {
  "parking": "rgba(147, 51, 234, 0.5)",
  "solar": "rgba(250, 204, 21, 0.5)",
  "garden": "rgba(74, 222, 128, 0.5)",
  "storage": "rgba(245, 158, 11, 0.5)",
  "wifi": "rgba(155, 135, 245, 0.5)",
  "pool": "rgba(14, 165, 233, 0.5)",
  "car": "rgba(99, 102, 241, 0.5)",
  "evcharger": "rgba(167, 139, 250, 0.5)"
};

const AssetResultList = () => {
  const { analysisComplete, analysisResults, isAnalyzing } = useGoogleMap();
  const isMobile = useIsMobile();

  // Don't show results until analysis is complete and not analyzing
  if (!analysisComplete || isAnalyzing || !analysisResults) return null;

  // Calculate total potential monthly income
  const totalMonthlyIncome = analysisResults.topOpportunities.reduce(
    (total, opportunity) => total + opportunity.monthlyRevenue, 
    0
  );

  return (
    <div className="w-full px-4 md:px-0 md:max-w-3xl">
      {/* Property Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="glass-effect overflow-hidden border-none relative">
          <div className="absolute inset-0 bg-gradient-to-r from-tiptop-purple/80 to-purple-600/70 rounded-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-lg"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">Property Summary</h2>
              <div className="text-right">
                <div className="text-lg text-gray-200">Estimated Monthly Income</div>
                <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">${totalMonthlyIncome}</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">Property Details:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-200"><span className="font-medium">Type:</span> {analysisResults.propertyType}</p>
                  <p className="text-gray-200"><span className="font-medium">Amenities:</span> {analysisResults.amenities.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-200"><span className="font-medium">Roof Area:</span> {analysisResults.rooftop.area} sq ft</p>
                  <p className="text-gray-200"><span className="font-medium">Parking Spaces:</span> {analysisResults.parking.spaces}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-gray-100">
              <p className="mb-2">This {analysisResults.propertyType} property offers excellent monetization potential through multiple assets.</p>
              <p>We've identified {analysisResults.topOpportunities.length} primary opportunities that could generate approximately ${totalMonthlyIncome} in monthly passive income.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg text-center md:text-left"
      >
        Available Asset Opportunities
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysisResults.topOpportunities.map((opportunity, index) => {
          const iconType = opportunity.icon as keyof typeof iconMap;
          const gradientClass = cardColorMap[iconType] || "from-purple-400/20 to-violet-500/10";
          const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
          
          return (
            <motion.div
              key={opportunity.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="asset-card glow-effect"
              style={{
                background: `linear-gradient(to bottom right, ${glowColor.replace('0.5', '0.2')}, transparent)`,
                boxShadow: `0 5px 20px ${glowColor}`
              }}
            >
              {iconMap[iconType]}
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {opportunity.title}
                </h3>
                <p className="text-2xl font-bold text-tiptop-purple">
                  ${opportunity.monthlyRevenue}/month
                </p>
                <p className="text-gray-200">{opportunity.description}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none rounded-lg"></div>
              
              {/* Enhanced glossy effect */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg pointer-events-none"></div>
            </motion.div>
          );
        })}
      </div>
      
      {analysisResults.restrictions && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 p-4 glass-effect rounded-lg"
          style={{
            background: "linear-gradient(to bottom right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))",
            boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)"
          }}
        >
          <h3 className="text-lg font-semibold text-red-400">Restrictions:</h3>
          <p className="text-gray-200">{analysisResults.restrictions}</p>
          
          {/* Enhanced glossy effect */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none"></div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetResultList;
