
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { motion } from "framer-motion";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from "@/components/ui/card";

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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="12" rx="2" fill="#FFB800" />
        <path d="M4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10Z" fill="#7D5700" />
        <rect x="11" y="18" width="2" height="4" fill="#7D5700" />
      </svg>
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="16" height="12" rx="1" fill="#EAB308" />
        <rect x="6" y="10" width="12" height="1" fill="#854D0E" />
        <rect x="6" y="13" width="12" height="1" fill="#854D0E" />
        <rect x="6" y="16" width="12" height="1" fill="#854D0E" />
        <path d="M12 8V4M8 4H16" stroke="#854D0E" strokeWidth="2" />
      </svg>
    </div>
  ),
  "wifi": (
    <div className="w-12 h-12 glass-effect rounded-lg flex items-center justify-center shadow-lg">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5C7.03 5 2.73 8.51 1 12C2.73 15.49 7.03 19 12 19C16.97 19 21.27 15.49 23 12C21.27 8.51 16.97 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="#C084FC" />
        <circle cx="12" cy="12" r="2" fill="#7E22CE" />
        <path d="M2 12C3.73 15.49 7.56 18 12 18C16.44 18 20.27 15.49 22 12" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 8C17.83 6.1 15.01 5 12 5C8.99 5 6.17 6.1 4 8" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
      </svg>
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
        {analysisResults.topOpportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="asset-card glow-effect"
          >
            {iconMap[opportunity.icon as keyof typeof iconMap]}
            <div>
              <h3 className="text-xl font-semibold text-white">
                {opportunity.title}
              </h3>
              <p className="text-2xl font-bold text-tiptop-purple">
                ${opportunity.monthlyRevenue}/month
              </p>
              <p className="text-gray-200">{opportunity.description}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none rounded-lg"></div>
          </motion.div>
        ))}
      </div>
      
      {analysisResults.restrictions && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 p-4 glass-effect rounded-lg"
        >
          <h3 className="text-lg font-semibold text-red-400">Restrictions:</h3>
          <p className="text-gray-200">{analysisResults.restrictions}</p>
        </motion.div>
      )}
    </div>
  );
};

export default AssetResultList;
